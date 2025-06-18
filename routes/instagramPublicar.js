const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const router = express.Router();

const mongoose = require("mongoose");

const Agendamento =
  mongoose.models.Agendamento ||
  mongoose.model(
    "Agendamento",
    new mongoose.Schema({
      titulo: String,
      descricao: String,
      cta: String,
      hashtags: String,
      data: String,
      hora: String,
      imagem: String,
      status: String,
      criadoEm: String,
    })
  );


// ✅ Middleware RAW BODY (opcional)
router.use((req, res, next) => {
  let data = "";
  req.on("data", chunk => {
    data += chunk;
  });

  req.on("end", () => {
    try {
      req.body = JSON.parse(data);
    } catch (e) {
      console.error("❌ JSON malformado:", e.message);
      return res.status(400).json({ erro: "JSON inválido." });
    }
    next();
  });
});

// 📤 POST para PUBLICAR NO INSTAGRAM usando IG Business ID salvo
router.post("/instagram/publicar", async (req, res) => {
  console.log("🚀 A rota /instagram/publicar foi acionada");

  try {
    // 1️⃣ Valida JWT
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("❌ Token não fornecido.");
      return res.status(401).json({ erro: "Token não fornecido." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario || !usuario.instagramBusinessId || !usuario.paginaAccessToken) {
      return res.status(400).json({
        erro: "Conta do Instagram ou Página do Facebook não conectadas corretamente no cadastro do usuário."
      });
    }

    // 2️⃣ Valida body
    const { legenda, midiaUrl, tipo } = req.body;
    if (!legenda || !midiaUrl || !tipo) {
      return res.status(400).json({
        erro: "Legenda, midiaUrl e tipo são obrigatórios."
      });
    }

    console.log("📥 Dados recebidos:", { legenda, midiaUrl, tipo });

    const igBusinessId = usuario.instagramBusinessId;
    const pageAccessToken = usuario.paginaAccessToken;

    // 3️⃣ Cria o container de mídia
    const containerUrl = `https://graph.facebook.com/v19.0/${igBusinessId}/media`;
    const containerPayload = {
      caption: legenda,
      [tipo === "IMAGE" ? "image_url" : "video_url"]: midiaUrl,
      access_token: pageAccessToken
    };

    console.log("📦 Payload do container:", containerPayload);

    const containerRes = await axios.post(containerUrl, containerPayload);
    const creationId = containerRes.data.id;
    console.log("✅ Container criado com ID:", creationId);

    // 4️⃣ Publica o container
    const publishUrl = `https://graph.facebook.com/v19.0/${igBusinessId}/media_publish`;
    const publishRes = await axios.post(publishUrl, {
      creation_id: creationId,
      access_token: pageAccessToken
    });

    console.log("✅ Post publicado com ID:", publishRes.data.id);

    // 5️⃣ Salva no banco de dados como "instagram"
const novoPost = new Agendamento({
  titulo: legenda,
  descricao: legenda,
  cta: "",
  hashtags: "",
  data: new Date().toISOString().split("T")[0], // data de hoje
  hora: new Date().toLocaleTimeString(), // hora de agora
  imagem: midiaUrl,
  status: "instagram",
  criadoEm: new Date().toISOString(),
});

await novoPost.save();
console.log("💾 Post salvo no MongoDB como status 'instagram'");

return res.status(200).json({
  sucesso: true,
  postId: publishRes.data.id,
  mensagem: "✅ Publicado com sucesso no Instagram!"
});


  } catch (erro) {
    if (erro.response) {
      console.error("📛 Erro da Graph API:");
      console.error("📎 Status:", erro.response.status);
      console.error("📩 Data:", erro.response.data);
    } else if (erro.request) {
      console.error("📡 Nenhuma resposta da API:", erro.request);
    } else {
      console.error("❌ Erro na configuração da requisição:", erro.message);
    }

    return res.status(500).json({ erro: "Erro ao publicar no Instagram." });
  }
});

module.exports = router;
