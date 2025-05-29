const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Middleware para autenticação
const autenticar = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token ausente." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido." });
  }
};

// 🔄 POST para salvar integração
router.post("/integracao/instagram", autenticar, async (req, res) => {
  try {
    const { instagramAccessToken, instagramBusinessId, facebookPageId, instagramName } = req.body;

    await Usuario.findByIdAndUpdate(req.usuarioId, {
      instagramAccessToken,
      instagramBusinessId,
      facebookPageId,
      instagramName,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
    });

    return res.status(200).json({ mensagem: "Dados salvos com sucesso." });
  } catch (err) {
    console.error("Erro ao salvar integração:", err);
    return res.status(500).json({ erro: "Erro interno ao salvar dados." });
  }
});

// 🔍 GET para verificar se o usuário já está integrado
router.get("/integracao/instagram", autenticar, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId);

    if (!usuario || !usuario.instagramAccessToken || !usuario.instagramBusinessId) {
      return res.status(200).json({ conectado: false });
    }

    return res.status(200).json({
      conectado: true,
      instagramBusinessId: usuario.instagramBusinessId,
      instagramAccessToken: usuario.instagramAccessToken,
      instagramName: usuario.instagramName || "Perfil conectado ✅",
    });
  } catch (err) {
    console.error("Erro ao verificar integração:", err);
    return res.status(500).json({ erro: "Erro interno ao verificar integração." });
  }
});

// 📤 POST para publicar no Instagram
router.post("/instagram/publicar", autenticar, async (req, res) => {
  try {
    const { legenda, imagemUrl } = req.body;

    if (!legenda || !imagemUrl) {
      return res.status(400).json({ erro: "Legenda e imagem são obrigatórios." });
    }

    const usuario = await Usuario.findById(req.usuarioId);

    if (!usuario.instagramAccessToken || !usuario.instagramBusinessId) {
      return res.status(400).json({ erro: "Conta do Instagram não conectada." });
    }

    // Criação do container
    const containerUrl = `https://graph.facebook.com/v19.0/${usuario.instagramBusinessId}/media`;
    const containerRes = await axios.post(containerUrl, {
      image_url: imagemUrl,
      caption: legenda,
      access_token: usuario.instagramAccessToken,
    });

    const creationId = containerRes.data.id;

    // Publicação do container
    const publishUrl = `https://graph.facebook.com/v19.0/${usuario.instagramBusinessId}/media_publish`;
    await axios.post(publishUrl, {
      creation_id: creationId,
      access_token: usuario.instagramAccessToken,
    });

    return res.status(200).json({ mensagem: "✅ Publicado com sucesso no Instagram!" });
  } catch (err) {
    console.error("Erro ao publicar:", err.response?.data || err.message);
    return res.status(500).json({ erro: "Erro ao publicar no Instagram." });
  }
});

module.exports = router;
