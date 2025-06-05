const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const bodyParser = require("body-parser");

const router = express.Router();

// 🔧 Middleware para leitura do body em JSON
router.use(bodyParser.json());

// 📤 POST para publicar no Instagram
router.post("/instagram/publicar", async (req, res) => {
  console.log("🚀 A rota /instagram/publicar foi acionada");

  try {
    console.log("📦 Body recebido:", req.body); // Exibe o body

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("❌ Token não fornecido.");
      return res.status(401).json({ erro: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔑 ID decodificado do token:", decoded.id);

    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      console.log("❌ Usuário não encontrado no banco de dados.");
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    console.log("👤 Usuário autenticado:", usuario.email || usuario._id);

    if (!usuario.instagramAccessToken || !usuario.instagramBusinessId) {
      console.log("⚠️ Instagram não está conectado para este usuário.");
      return res.status(400).json({ erro: "Usuário sem Instagram conectado" });
    }

    const { legenda, midiaUrl, tipo } = req.body;
    console.log("📥 Dados recebidos no backend:", { legenda, midiaUrl, tipo });

    if (!legenda || !midiaUrl || !tipo) {
      console.log("🚫 Falta legenda, midiaUrl ou tipo.");
      return res.status(400).json({ erro: "Legenda, mídia e tipo são obrigatórios." });
    }

    // 🛠️ Etapa 1: Criar o container
    const containerUrl = `https://graph.facebook.com/v19.0/${usuario.instagramBusinessId}/media`;
    const containerPayload = {
      caption: legenda,
      [tipo === "IMAGE" ? "image_url" : "video_url"]: midiaUrl,
      access_token: usuario.instagramAccessToken,
    };

    const containerRes = await axios.post(containerUrl, containerPayload);
    const creationId = containerRes.data.id;
    console.log("✅ Container criado com ID:", creationId);

    // 🚀 Etapa 2: Publicar o container
    const publishUrl = `https://graph.facebook.com/v19.0/${usuario.instagramBusinessId}/media_publish`;
    const publishRes = await axios.post(publishUrl, {
      creation_id: creationId,
      access_token: usuario.instagramAccessToken,
    });

    console.log("✅ Post publicado com ID:", publishRes.data.id);

    return res.status(200).json({ sucesso: true, postId: publishRes.data.id });

  } catch (erro) {
    if (erro.response) {
      console.error("📛 Erro da Graph API:");
      console.error("📎 Status:", erro.response.status);
      console.error("📩 Data:", erro.response.data);
      console.error("🧾 Headers:", erro.response.headers);
    } else if (erro.request) {
      console.error("📡 Nenhuma resposta da API:", erro.request);
    } else {
      console.error("❌ Erro na configuração da requisição:", erro.message);
    }

    return res.status(500).json({ erro: "Erro ao publicar no Instagram." });
  }
});

module.exports = router;
