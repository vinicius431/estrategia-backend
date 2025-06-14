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

    console.log("📦 Dados recebidos para salvar:", req.body);
    console.log("👤 Usuário ID:", req.usuarioId);

    // ✅ Busca o token da página usando o token do usuário (instagramAccessToken)
    const paginasRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${instagramAccessToken}`);
    const paginas = paginasRes.data.data;

    const pagina = paginas.find(p => p.id === facebookPageId);
    if (!pagina || !pagina.access_token) {
      return res.status(400).json({ erro: "Não foi possível obter o token da página." });
    }

    const paginaAccessToken = pagina.access_token;

    // 💾 Salva os dados da integração
    await Usuario.findByIdAndUpdate(
      req.usuarioId,
      {
        instagramAccessToken,
        instagramBusinessId,
        facebookPageId,
        instagramName,
        paginaAccessToken,
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

    if (!usuario || !usuario.instagramAccessToken || !usuario.instagramBusinessId) {
      return res.status(200).json({ conectado: false });
    }

    return res.status(200).json({
      conectado: true,
      instagramBusinessId: usuario.instagramBusinessId,
      instagramAccessToken: usuario.instagramAccessToken,
      paginaAccessToken: usuario.paginaAccessToken,
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
    const { legenda, midiaUrl } = req.body;

    if (!legenda || !midiaUrl) {
      return res.status(400).json({ erro: "Legenda e imagem são obrigatórios." });
    }

    const usuario = await Usuario.findById(req.usuarioId);

    if (!usuario.instagramAccessToken || !usuario.instagramBusinessId) {
      return res.status(400).json({ erro: "Conta do Instagram não conectada." });
    }

    // Criação do container
    const containerUrl = `https://graph.facebook.com/v19.0/${usuario.instagramBusinessId}/media`;
    const containerRes = await axios.post(containerUrl, {
      image_url: midiaUrl,
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

// 🔑 POST para renovar o token do usuário e atualizar tudo no banco
router.post("/integracao/renovar-token", autenticar, async (req, res) => {
  try {
    const { userAccessToken } = req.body;

    if (!userAccessToken) {
      return res.status(400).json({ erro: "Token de usuário é obrigatório." });
    }

    // 1️⃣ Busca as páginas com o novo token do usuário
    const pagesRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`);
    const pages = pagesRes.data.data;
    const page = pages[0];

    if (!page || !page.access_token) {
      return res.status(400).json({ erro: "Não foi possível obter o token da página." });
    }

    const pageId = page.id;
    const pageAccessToken = page.access_token;

    // 2️⃣ Busca o Instagram Business ID da página
    const pageInfoRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}?fields=connected_instagram_account{name}&access_token=${pageAccessToken}`);
    const instagramAccount = pageInfoRes.data.connected_instagram_account;

    if (!instagramAccount || !instagramAccount.id) {
      return res.status(400).json({ erro: "Nenhuma conta do Instagram conectada à página." });
    }

    const instagramBusinessId = instagramAccount.id;
    const instagramName = instagramAccount.name;

    // 3️⃣ Atualiza o banco do usuário com tudo novo
    await Usuario.findByIdAndUpdate(
      req.usuarioId,
      {
        instagramAccessToken: userAccessToken,
        paginaAccessToken: pageAccessToken,
        instagramBusinessId: instagramBusinessId,
        instagramName: instagramName,
        facebookPageId: pageId,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
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
