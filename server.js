const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
require("dotenv").config();

const { cloudinary, storage } = require("./config/cloudinary");
const upload = multer({ storage });
const Usuario = require("./models/Usuario");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_ultra_forte";

// ✅ CORS manual configurado corretamente
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://estrategia-frontend.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // responde preflight
  }
  
  next();
});

app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("Servidor EstrategIA ativo");
});

// Conexão com MongoDB
mongoose
  .connect(process.env.URL_MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🟢 Conectado ao MongoDB Atlas"))
  .catch((err) => console.error("🔴 Erro ao conectar no MongoDB:", err));

// Middleware de autenticação com Bearer token
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

// MODELO de Agendamento
const AgendamentoSchema = new mongoose.Schema({
  titulo: String,
  descricao: String,
  cta: String,
  hashtags: String,
  data: String,
  imagem: String,
  status: String,
  criadoEm: String,
});
const Agendamento = mongoose.model("Agendamento", AgendamentoSchema);

// ROTAS DE AGENDAMENTO
app.post("/agendamentos", autenticarToken, upload.single("imagem"), async (req, res) => {
  try {
    const { titulo, descricao, cta, hashtags, data, status } = req.body;
    const imagemUrl = req.file ? req.file.path : null;

    const novo = new Agendamento({
      titulo,
      descricao,
      cta,
      hashtags,
      data,
      imagem: imagemUrl,
      status: status || "agendado",
      criadoEm: new Date().toISOString(),
    });

    await novo.save();
    res.status(201).json({ mensagem: "Agendamento salvo com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao salvar o agendamento." });
  }
});

app.get("/agendamentos", autenticarToken, async (req, res) => {
  try {
    const lista = await Agendamento.find().sort({ criadoEm: -1 });
    res.json(lista);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ erro: "Erro ao excluir o agendamento." });
  }
});

// ROTAS DE USUÁRIO
app.post("/auth/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ erro: "Email já cadastrado." });

    const hash = await bcrypt.hash(senha, 10);
    const novoUsuario = new Usuario({ nome, email, senha: hash });
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
    const usuario = await Usuario.findOneAndUpdate(
      { email },
      { plano: novoPlano },
      { new: true }
    );

    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

    res.json({
      mensagem: "Plano atualizado com sucesso!",
      plano: usuario.plano,
    });
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

// ROTA DE IA
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
            content: "Você é um gerador de conteúdo de redes sociais.",
          },
          {
            role: "user",
            content: `Crie 10 títulos (headlines) e 10 descrições criativas para um post sobre: ${tema}.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await resposta.json();
    const respostaIA = data.choices?.[0]?.message?.content || "";

    const [parteHeadlines, parteDescricoes] = respostaIA.split(/Descri[çc]ões:/i);
    const headlines = (parteHeadlines.match(/\d+\.\s.+/g) || []).map((l) =>
      l.replace(/^\d+\.\s*/, "")
    );
    const descricoes = (parteDescricoes?.match(/\d+\.\s.+/g) || []).map((l) =>
      l.replace(/^\d+\.\s*/, "")
    );

    res.json({ headlines, descricoes });
  } catch (err) {
    console.error("ERRO IA:", err);
    res.status(500).json({ erro: "Erro ao gerar conteúdo com IA." });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});

