const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const router = express.Router();

// Middleware para capturar o body cru e tentar decodificar manualmente (para DEBUG)
router.use((req, res, next) => {
  let data = "";
  req.on("data", chunk => {
    data += chunk;
  });

  req.on("end", () => {
    console.log("🧾 RAW BODY recebido:", data);
    try {
      req.body = JSON.parse(data);
    } catch (e) {
      console.error("❌ JSON malformado:", e.message);
      return res.status(400).json({ erro: "JSON inválido." });
    }
    next();
  });
});

// 📤 POST para publicar no Instagram
router.post("/instagram/publicar", async (req, res) => {
  console.log("🚀 A rota /instagram/publicar foi acionada");
  console.log("📍 Headers recebidos:", req.headers);
  console.log("📩 Chegou na rota com body:", req.body);

  try {
    // 1️⃣ Valida token JWT
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

    // 2️⃣ Valida dados recebidos
    const { legenda, midiaUrl, tipo, userAccessToken } = req.body;
    console.log("📥 Dados recebidos:", { legenda, midiaUrl, tipo, userAccessToken });

    if (!legenda || !midiaUrl || !tipo || !userAccessToken) {
      return res.status(400).json({ erro: "Legenda, mídia, tipo e userAccessToken são obrigatórios." });
    }

    // 3️⃣ Busca dados frescos da página e Instagram Business ID em tempo real
    const pagesRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`);
    const page = pagesRes.data.data[0];
    if (!page) {
      return res.status(400).json({ erro: "Nenhuma página encontrada." });
    }

    const pageAccessToken = page.access_token;
    const pageInfoRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}?fields=connected_instagram_account{name}&access_token=${pageAccessToken}`);
    const igBusinessId = pageInfoRes.data.connected_instagram_account?.id;

    if (!igBusinessId) {
      return res.status(400).json({ erro: "Instagram Business ID não encontrado para a página." });
    }

    // 4️⃣ Cria o container
    const containerUrl = `https://graph.facebook.com/v19.0/${igBusinessId}/media`;
    const containerPayload = {
      caption: legenda,
      [tipo === "IMAGE" ? "image_url" : "video_url"]: midiaUrl,
      access_token: pageAccessToken,
    };

    const containerRes = await axios.post(containerUrl, containerPayload);
    const creationId = containerRes.data.id;
    console.log("✅ Container criado com ID:", creationId);

    // 5️⃣ Publica o container
    const publishUrl = `https://graph.facebook.com/v19.0/${igBusinessId}/media_publish`;
    const publishRes = await axios.post(publishUrl, {
      creation_id: creationId,
      access_token: pageAccessToken,
    });

    console.log("✅ Post publicado com ID:", publishRes.data.id);

    return res.status(200).json({ sucesso: true, postId: publishRes.data.id });

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
