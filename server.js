const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
require("dotenv").config();
console.log("🧪 Verificando variáveis de ambiente:");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_KEY:", process.env.CLOUDINARY_KEY);
console.log("CLOUDINARY_SECRET:", process.env.CLOUDINARY_SECRET);

const { cloudinary, storage } = require("./config/cloudinary");
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
const Usuario = require("./models/Usuario");


const app = express(); // ✅ primeiro define o app

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_ultra_forte";

// ✅ CORS

  const allowedOrigins = [
  "http://localhost:5173",
  "https://estrategia-frontend.vercel.app",
  "https://estrategia-frontend-a7m5lr9fc-vincius-nogueiras-projects.vercel.app",
  "https://estrategia-frontend-oohkt1r4z-vincius-nogueiras-projects.vercel.app",
  "https://estrategia-frontend-epdnsb6l1-vincius-nogueiras-projects.vercel.app",
  "https://appestrategia.com",
  "https://www.appestrategia.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));



const integracaoRoutes = require("./routes/integracao");
app.use("/api", integracaoRoutes);

const publicarInstagram = require("./routes/instagramPublicar");
app.use("/api", publicarInstagram);



const uploadRoute = require("./routes/upload");
app.use("/", uploadRoute);

// Teste
app.get("/", (req, res) => {
  res.send("Servidor EstrategIA ativo");
});

// MongoDB
mongoose
  .connect(process.env.URL_MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("🟢 Conectado ao MongoDB Atlas"))
  .catch((err) => console.error("🔴 Erro ao conectar no MongoDB:", err));

// Auth Middleware
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ erro: "Token não fornecido" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token malformado" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ erro: "Token inválido" });
    req.usuarioId = decoded.id;
    next();
  });
}

// Agendamento Model
const AgendamentoSchema = new mongoose.Schema({
  titulo: String,
  descricao: String,
  cta: String,
  hashtags: String,
  data: String,
  hora: String,
  imagem: String,
  status: String,
  criadoEm: String,
});
const Agendamento = mongoose.model("Agendamento", AgendamentoSchema);

// TutorHistorico Model
const TutorSchema = new mongoose.Schema({
  usuarioId: String,
  tema: String,
  headline: String,
  descricao: String,
  cta: String,
  hashtags: [String],
  criadoEm: String,
});
const TutorHistorico = mongoose.model("TutorHistorico", TutorSchema);

app.post(
  "/agendamentos",
  autenticarToken,
  (req, res, next) => {
    upload.single("imagem")(req, res, function (err) {
      if (err) {
        console.error("❌ Erro no multer:", err);
        return res.status(400).json({ erro: err.message || "Erro no upload do arquivo." });
      }
      next(); // vai para o próximo handler
    });
  },
  async (req, res) => {
    try {
      console.log("📥 Body recebido:", req.body);
      console.log("📁 Arquivo recebido:", req.file);

      const { titulo, descricao, cta, hashtags, data, hora, status } = req.body;

     let mediaUrl = null;
if (req.file && req.file.path) {
  mediaUrl = req.file.path;
  console.log("✅ URL automática do Cloudinary:", mediaUrl);
} else {
  return res.status(400).json({ erro: "Nenhuma mídia foi enviada." });
}


      const novo = new Agendamento({
        titulo,
        descricao,
        cta,
        hashtags,
        data,
        hora,
        imagem: mediaUrl,
        status: status || "agendado",
        criadoEm: new Date().toISOString(),
      });

      await novo.save();
      res.status(201).json({ mensagem: "Agendamento salvo com sucesso!" });
    } catch (err) {
      console.error("❌ Erro geral:", err);
      res.status(500).json({ erro: err.message || "Erro ao salvar o agendamento." });
    }
  }
);


app.get("/agendamentos", autenticarToken, async (req, res) => {
  try {
    const lista = await Agendamento.find().sort({ criadoEm: -1 });
    res.json(lista);
  } catch (err) {
    console.error("❌ Erro completo:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    res.status(500).json({ erro: "Erro ao buscar os agendamentos." });
  }
});

app.delete("/agendamentos/:id", autenticarToken, async (req, res) => {
  try {
    const deletado = await Agendamento.findByIdAndDelete(req.params.id);
    if (deletado) {
      res.json({ mensagem: "Agendamento excluído com sucesso!" });
    } else {
      res.status(404).json({ erro: "Agendamento não encontrado." });
    }
  } catch (err) {
    console.error("❌ Erro completo:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    res.status(500).json({ erro: "Erro ao excluir o agendamento." });
  }
});

app.put("/agendamentos/:id", autenticarToken, upload.single("imagem"), async (req, res) => {
  try {
    const { titulo, descricao, cta, hashtags, data, hora } = req.body;
    const agendamento = await Agendamento.findById(req.params.id);

    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento não encontrado." });
    }

    // Atualiza os campos textuais
    agendamento.titulo = titulo;
    agendamento.descricao = descricao;
    agendamento.cta = cta;
    agendamento.hashtags = hashtags;
    agendamento.data = data;
    agendamento.hora = hora;

    // Se tiver nova mídia, faz upload pro Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto", // aceita imagem e vídeo
      });
      agendamento.imagem = result.secure_url;
    }

    await agendamento.save();
    res.json({ mensagem: "Agendamento atualizado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao atualizar agendamento:", err);
    res.status(500).json({ erro: "Erro interno ao atualizar o agendamento." });
  }
});


app.use(express.json());

// Auth
app.post("/auth/register", async (req, res) => {
  const { nome, email, senha, telefone, nascimento, sexo } = req.body;

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ erro: "Email já cadastrado." });

    const hash = await bcrypt.hash(senha, 10);

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: hash,
      telefone,
      nascimento,
      sexo,
    });

    await novoUsuario.save();

    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao registrar usuário." });
  }
});


app.post("/auth/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);
    if (!senhaConfere) return res.status(401).json({ erro: "Senha inválida." });

    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: "2d" });

    res.json({
      token,
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        plano: usuario.plano,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao fazer login." });
  }
});

app.put("/auth/atualizar-plano", async (req, res) => {
  const { email, novoPlano } = req.body;
  try {
    const usuario = await Usuario.findOneAndUpdate({ email }, { plano: novoPlano }, { new: true });
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

    res.json({ mensagem: "Plano atualizado com sucesso!", plano: usuario.plano });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar o plano." });
  }
});

app.post("/auth/recarregar-plano", async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

    res.json({ plano: usuario.plano });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao recarregar plano." });
  }
});

// IA: Gerar conteúdo
app.post("/gerar-conteudo", async (req, res) => {
  const { tema } = req.body;
  if (!tema) return res.status(400).json({ erro: "Tema é obrigatório." });

  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um especialista em marketing digital. Responda exatamente com esse formato (sem textos extras):\n\nTítulos:\n1. ...\n2. ...\n...\n\nDescrições:\n1. ...\n2. ...\n...",
          },
          {
            role: "user",
            content: `Crie 10 títulos e 10 descrições criativas para o tema: ${tema}`,
          },
        ],
        temperature: 0.7,
      }),
    });
    
    const data = await resposta.json();
    const respostaIA = data.choices?.[0]?.message?.content || "";

    const [parteTitulos, parteDescricoes] = respostaIA.split(/Descri[çc]ões:/i);
    const headlines = (parteTitulos.match(/\d+\.\s.+/g) || []).map((l) => l.replace(/^\d+\.\s*/, ""));
    const descricoes = (parteDescricoes?.match(/\d+\.\s.+/g) || []).map((l) => l.replace(/^\d+\.\s*/, ""));

    if (!headlines.length && !descricoes.length) {
      return res.status(400).json({ erro: "A IA não retornou conteúdo utilizável. Tente outro tema mais direto." });
    }

    res.json({ headlines, descricoes });
  } catch (err) {
    res.status(500).json({ erro: err.message || "Erro ao gerar conteúdo com IA." });
  }
});

// IA: Gerar apenas HEADLINE (título criativo)
app.post("/gerar-headline", async (req, res) => {
  const { tema } = req.body;
  if (!tema) return res.status(400).json({ erro: "Tema é obrigatório." });

  console.log("📩 Tema recebido em /gerar-headline:", tema);

  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um estrategista criativo de redes sociais. Gere exatamente 5 headlines criativas e impactantes para posts no Instagram com base no tema. Responda apenas com as frases separadas por quebra de linha, sem numeração.",
          },
          {
            role: "user",
            content: `Tema: ${tema}`,
          },
        ],
        temperature: 0.75,
      }),
    });

    const data = await resposta.json();
    const texto = data.choices?.[0]?.message?.content || "";

    const titulos = texto
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (!titulos.length) return res.status(400).json({ erro: "A IA não retornou nenhum título válido." });

    res.json({ titulos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao gerar títulos com IA." });
  }
});


// IA: Gerar apenas DESCRIÇÃO (texto criativo)
app.post("/gerar-descricao", async (req, res) => {
  const { tema } = req.body;
  if (!tema) return res.status(400).json({ erro: "Tema é obrigatório." });

  console.log("📩 Tema recebido em /gerar-descricao:", tema);

  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um redator criativo para redes sociais. Gere 3 variações de descrições curtas e envolventes para uma publicação no Instagram com base no tema fornecido. Responda apenas com os parágrafos separados por quebra de linha, sem numeração.",
          },
          {
            role: "user",
            content: `Tema: ${tema}`,
          },
        ],
        temperature: 0.75,
      }),
    });

    const data = await resposta.json();
    const texto = data.choices?.[0]?.message?.content || "";

    const descricoes = texto
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (!descricoes.length) return res.status(400).json({ erro: "A IA não retornou nenhuma descrição válida." });

    res.json({ descricoes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao gerar descrições com IA." });
  }
});


// IA: Hashtags
app.post("/gerar-hashtags", async (req, res) => {
  const { tema } = req.body;
  if (!tema) return res.status(400).json({ erro: "Tema é obrigatório." });

  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um gerador de hashtags populares e atualizadas no Instagram. Responda apenas com uma lista de hashtags relevantes e atuais para o tema enviado.",
          },
          {
            role: "user",
            content: `Gere 15 hashtags atuais e populares para o tema: ${tema}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await resposta.json();
    const respostaTexto = data.choices?.[0]?.message?.content || "";
    const hashtags = respostaTexto.match(/#[\w\u00C0-\u00FF]+/g)?.slice(0, 15) || [];

    if (!hashtags.length) {
      return res.status(400).json({ erro: "Não foi possível extrair hashtags." });
    }

    res.json({ hashtags });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar hashtags com IA." });
  }
});

// IA: Tutor
app.post("/gerar-tutor", async (req, res) => {
  const { tema } = req.body;
  if (!tema) return res.status(400).json({ erro: "Tema é obrigatório." });

  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
Você é um tutor de marketing digital que ajuda criadores de conteúdo a planejar postagens para o Instagram.

Responda com exatamente este formato (sem explicações):

Headlines:
1. ...
2. ...
3. ...
4. ...
5. ...

Descrições:
1. ...
2. ...
3. ...

CTAs:
1. ...
2. ...
3. ...

Hashtags:
#tag1 #tag2 #tag3 #tag4 #tag5
            `.trim(),
          },
          {
            role: "user",
            content: `Tema: ${tema}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await resposta.json();
    const texto = data.choices?.[0]?.message?.content || "";

    const headlines = (texto.match(/Headlines:\s*([\s\S]+?)Descrições:/i)?.[1] || "")
      .split("\n")
      .map((l) => l.replace(/^\d+\.\s*/, "").trim())
      .filter((l) => l);

    const descricoes = (texto.match(/Descrições:\s*([\s\S]+?)CTAs:/i)?.[1] || "")
      .split("\n")
      .map((l) => l.replace(/^\d+\.\s*/, "").trim())
      .filter((l) => l);

    const ctas = (texto.match(/CTAs:\s*([\s\S]+?)Hashtags:/i)?.[1] || "")
      .split("\n")
      .map((l) => l.replace(/^\d+\.\s*/, "").trim())
      .filter((l) => l);

    const hashtagsStr = texto.match(/Hashtags:\s*(.+)/i)?.[1] || "";
    const hashtags = hashtagsStr
      .split(/[\s,]+/)
      .filter((t) => t.startsWith("#"))
      .slice(0, 5);

    if (!headlines.length || !descricoes.length || !ctas.length || !hashtags.length) {
      return res.status(400).json({ erro: "A IA não retornou conteúdo utilizável." });
    }

    res.json({ headlines, descricoes, ctas, hashtags });
  } catch (err) {
    console.error("❌ Erro em /gerar-tutor:", err);
    res.status(500).json({ erro: "Erro ao gerar conteúdo do tutor com IA." });
  }
});


// ✅ Rota para salvar histórico do Tutor
app.post("/salvar-tutor", autenticarToken, async (req, res) => {
  try {
    const { tema, headline, descricao, cta, hashtags } = req.body;

    const novoRegistro = new TutorHistorico({
      usuarioId: req.usuarioId,
      tema,
      headline,
      descricao,
      cta,
      hashtags,
      criadoEm: new Date().toISOString(),
    });

    await novoRegistro.save();
    res.status(201).json({ mensagem: "Histórico salvo com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao salvar histórico do tutor:", err);
    res.status(500).json({ erro: "Erro interno ao salvar histórico do tutor." });
  }
});

// ✅ Rota para buscar histórico do Tutor por usuário
app.get("/tutor-historico", autenticarToken, async (req, res) => {
  try {
    const historico = await TutorHistorico.find({ usuarioId: req.usuarioId }).sort({ criadoEm: -1 });
    res.json(historico);
  } catch (err) {
    console.error("❌ Erro ao buscar histórico do tutor:", err);
    res.status(500).json({ erro: "Erro interno ao buscar histórico do tutor." });
  }
});

// ✅ Rota para redirecionar o usuário para o login do Facebook
app.get("/auth/facebook", (req, res) => {
  const redirectUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish&response_type=code`;

  res.redirect(redirectUrl);
});

app.post("/integracao/instagram", autenticarToken, async (req, res) => {
  const { instagramAccessToken, instagramBusinessId, facebookPageId } = req.body;

  if (!instagramAccessToken || !instagramBusinessId || !facebookPageId) {
    return res.status(400).json({ erro: "Dados incompletos." });
  }

  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuarioId,
      {
        instagramAccessToken,
        instagramBusinessId,
        facebookPageId,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    res.status(200).json({ mensagem: "Instagram conectado com sucesso." });
  } catch (err) {
    console.error("Erro ao salvar dados do Instagram:", err);
    res.status(500).json({ erro: "Erro ao salvar dados do Instagram." });
  }
});

// ✅ Rota GET para verificar se o Instagram está conectado
app.get("/integracao/instagram", autenticarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const { instagramAccessToken, instagramBusinessId } = usuario;

    res.json({ instagramAccessToken, instagramBusinessId });
  } catch (err) {
    console.error("❌ Erro ao verificar integração do Instagram:", err);
    res.status(500).json({ erro: "Erro ao verificar integração." });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
