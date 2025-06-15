const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const router = express.Router();

// ✅ Middleware para logar RAW BODY (opcional, bom para debug)
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

// 📤 POST para PUBLICAR NO INSTAGRAM
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
    if (!usuario || !usuario.facebookPageId) {
      return res.status(400).json({ erro: "Página do Facebook não encontrada no cadastro do usuário." });
    }

    // 2️⃣ Valida body
    const { legenda, midiaUrl, tipo, userAccessToken } = req.body;
    if (!legenda || !midiaUrl || !tipo || !userAccessToken) {
      return res.status(400).json({ erro: "Legenda, midiaUrl, tipo e userAccessToken são obrigatórios." });
    }

    console.log("📥 Dados recebidos:", { legenda, midiaUrl, tipo });

    // 3️⃣ Busca a página CERTA usando facebookPageId do Mongo
    const pagesRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`);
    const page = pagesRes.data.data.find(p => p.id === usuario.facebookPageId);
    if (!page) {
      return res.status(400).json({ erro: "Página do Facebook não encontrada ou sem permissão com este token." });
    }

    const pageAccessToken = page.access_token;

    // 4️⃣ Busca IG vinculado EM TEMPO REAL
    const pageInfoRes = await axios.get(
      `https://graph.facebook.com/v19.0/${page.id}?fields=connected_instagram_account{name}&access_token=${pageAccessToken}`
    );
    const igAccount = pageInfoRes.data.connected_instagram_account;
    if (!igAccount || !igAccount.id) {
      return res.status(400).json({ erro: "Conta do Instagram não vinculada à página." });
    }

    const igBusinessId = igAccount.id;

    // 5️⃣ Cria o container
    const containerUrl = `https://graph.facebook.com/v19.0/${igBusinessId}/media`;
    const containerPayload = {
      caption: legenda,
      [tipo === "IMAGE" ? "image_url" : "video_url"]: midiaUrl,
      access_token: pageAccessToken,
    };

    console.log("📦 Payload do container:", containerPayload);

    const containerRes = await axios.post(containerUrl, containerPayload);
    const creationId = containerRes.data.id;
    console.log("✅ Container criado com ID:", creationId);

    // 6️⃣ Publica o container
    const publishUrl = `https://graph.facebook.com/v19.0/${igBusinessId}/media_publish`;
    const publishRes = await axios.post(publishUrl, {
      creation_id: creationId,
      access_token: pageAccessToken,
    });

    console.log("✅ Post publicado com ID:", publishRes.data.id);

    return res.status(200).json({
      sucesso: true,
      postId: publishRes.data.id,
      mensagem: "✅ Publicado com sucesso no Instagram!",
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
