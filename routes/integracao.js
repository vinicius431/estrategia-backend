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

// ✅ POST para salvar integração (sem salvar IG ID fixo)
router.post("/integracao/instagram", autenticar, async (req, res) => {
  try {
    const { instagramAccessToken, facebookPageId, instagramName } = req.body;

    console.log("📦 Dados recebidos para salvar:", req.body);
    console.log("👤 Usuário ID:", req.usuarioId);

    await Usuario.findByIdAndUpdate(
      req.usuarioId,
      {
        facebookPageId,
        paginaAccessToken: instagramAccessToken, // aqui é o pageAccessToken real
        instagramName,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      },
      { new: true, useFindAndModify: false }
    );

    return res.status(200).json({ mensagem: "Dados salvos com sucesso." });
  } catch (err) {
    console.error("Erro ao salvar integração:", err.response?.data || err.message);
    return res.status(500).json({ erro: "Erro interno ao salvar dados." });
  }
});

// 🔍 GET para verificar se o usuário já está integrado
router.get("/integracao/instagram", autenticar, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId);

    if (!usuario || !usuario.paginaAccessToken || !usuario.facebookPageId) {
      return res.status(200).json({ conectado: false });
    }

    return res.status(200).json({
      conectado: true,
      facebookPageId: usuario.facebookPageId,
      paginaAccessToken: usuario.paginaAccessToken,
      instagramName: usuario.instagramName || "Perfil conectado ✅",
    });
  } catch (err) {
    console.error("Erro ao verificar integração:", err);
    return res.status(500).json({ erro: "Erro interno ao verificar integração." });
  }
});

// 📤 POST para publicar no Instagram (busca IG ID em tempo real)
router.post("/instagram/publicar", autenticar, async (req, res) => {
  try {
    const { legenda, midiaUrl, tipo, userAccessToken } = req.body;

    if (!legenda || !midiaUrl || !tipo || !userAccessToken) {
      return res.status(400).json({ erro: "Legenda, mídia, tipo e userAccessToken são obrigatórios." });
    }

    const usuario = await Usuario.findById(req.usuarioId);
    if (!usuario || !usuario.facebookPageId) {
      return res.status(400).json({ erro: "Conta do Instagram não conectada." });
    }

    // 🔑 Busca dados frescos
    const pagesRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`);
    const pages = pagesRes.data.data;
    const page = pages.find(p => p.id === usuario.facebookPageId);
    if (!page) {
      return res.status(400).json({ erro: "Página do Facebook não encontrada." });
    }

    const pageAccessToken = page.access_token;

    const pageInfoRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}?fields=connected_instagram_account{name}&access_token=${pageAccessToken}`);
    const igAccount = pageInfoRes.data.connected_instagram_account;
    if (!igAccount || !igAccount.id) {
      return res.status(400).json({ erro: "Conta do Instagram não conectada à página." });
    }

    const igBusinessId = igAccount.id;

    // ✅ Cria o container
    const containerUrl = `https://graph.facebook.com/v19.0/${igBusinessId}/media`;
    const containerPayload = {
      caption: legenda,
      [tipo === "IMAGE" ? "image_url" : "video_url"]: midiaUrl,
      access_token: pageAccessToken,
    };
    const containerRes = await axios.post(containerUrl, containerPayload);
    const creationId = containerRes.data.id;

    // ✅ Publica
    const publishUrl = `https://graph.facebook.com/v19.0/${igBusinessId}/media_publish`;
    const publishRes = await axios.post(publishUrl, {
      creation_id: creationId,
      access_token: pageAccessToken,
    });

    return res.status(200).json({ mensagem: "✅ Publicado com sucesso!", postId: publishRes.data.id });
  } catch (err) {
    console.error("Erro ao publicar:", err.response?.data || err.message);
    return res.status(500).json({ erro: "Erro ao publicar no Instagram." });
  }
});

// 🔑 POST para renovar token
router.post("/integracao/renovar-token", autenticar, async (req, res) => {
  try {
    const { userAccessToken } = req.body;
    if (!userAccessToken) {
      return res.status(400).json({ erro: "Token de usuário é obrigatório." });
    }

    const pagesRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`);
    const page = pagesRes.data.data[0];
    if (!page) {
      return res.status(400).json({ erro: "Nenhuma página encontrada." });
    }

    const pageId = page.id;
    const pageAccessToken = page.access_token;

    const pageInfoRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}?fields=connected_instagram_account{name}&access_token=${pageAccessToken}`);
    const igAccount = pageInfoRes.data.connected_instagram_account;
    const instagramName = igAccount?.name || "";

    await Usuario.findByIdAndUpdate(
      req.usuarioId,
      {
        paginaAccessToken: pageAccessToken,
        facebookPageId: pageId,
        instagramName,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      { new: true, useFindAndModify: false }
    );

    return res.status(200).json({ mensagem: "Token renovado e salvo com sucesso!" });
  } catch (err) {
    console.error("Erro ao renovar token:", err.response?.data || err.message);
    return res.status(500).json({ erro: "Erro ao renovar token." });
  }
});

module.exports = router;
