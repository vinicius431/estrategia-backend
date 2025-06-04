const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const bodyParser = require("body-parser");

const router = express.Router();

// 🔧 Middleware para garantir leitura do body em JSON
router.use(bodyParser.json());

// 📤 POST para publicar no Instagram
router.post("/instagram/publicar", async (req, res) => {
  console.log("🚀 A rota /instagram/publicar foi acionada");

  try {
    console.log("📦 Body recebido:", req.body); // Debug: legenda, midiaUrl, tipo

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ erro: "Token não fornecido" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔑 ID do usuário decodificado:", decoded.id); // Debug

    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      console.log("❌ Usuário não encontrado no MongoDB.");
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    console.log("👤 Usuário encontrado:", usuario.email || usuario._id); // Debug

    if (!usuario.instagramAccessToken || !usuario.instagramBusinessId) {
      console.log("⚠️ Instagram não conectado no perfil do usuário.");
      return res.status(400).json({ erro: "Usuário sem Instagram conectado" });
    }

    const { legenda, midiaUrl, tipo } = req.body;

    if (!legenda || !midiaUrl) {
      console.log("🚫 Falta legenda ou midiaUrl.");
      return res.status(400).json({ erro: "Legenda e mídia são obrigatórios." });
    }

    // 1. Criar o container
    const containerUrl = `https://graph.facebook.com/v19.0/${usuario.instagramBusinessId}/media`;
    const containerRes = await axios.post(containerUrl, {
      caption: legenda,
      [tipo === "IMAGE" ? "image_url" : "video_url"]: midiaUrl,
      access_token: usuario.instagramAccessToken,
    });

    const creationId = containerRes.data.id;

    // 2. Publicar o container
    const publishUrl = `https://graph.facebook.com/v19.0/${usuario.instagramBusinessId}/media_publish`;
    const publishRes = await axios.post(publishUrl, {
      creation_id: creationId,
      access_token: usuario.instagramAccessToken,
    });

    return res.status(200).json({ sucesso: true, postId: publishRes.data.id });

  } catch (erro) {
  if (erro.response) {
    console.error("📛 Erro da Graph API:");
    console.error("📎 Status:", erro.response.status);
    console.error("📩 Data:", erro.response.data);
    console.error("🧾 Headers:", erro.response.headers);
  } else if (erro.request) {
    console.error("📡 Sem resposta da API:", erro.request);
  } else {
    console.error("❌ Erro ao configurar a requisição:", erro.message);
  }

  return res.status(500).json({ erro: "Erro ao publicar no Instagram." });
}
});

module.exports = router;
