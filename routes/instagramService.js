const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router(); // ✅ precisa disso para usar no app.use()

const INSTAGRAM_TOKEN = process.env.TOKEN_DE_60_DIAS;
const INSTAGRAM_BUSINESS_ID = "17841474725070928"; // substitua se necessário

// Buscar posts do Instagram
router.get("/instagram/posts", async (req, res) => {
  try {
    const url = `https://graph.facebook.com/v19.0/${INSTAGRAM_BUSINESS_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${INSTAGRAM_TOKEN}`;
    const response = await axios.get(url);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Erro ao buscar posts:", error.response?.data || error.message);
    return res.status(500).json({ error: "Erro ao buscar posts do Instagram" });
  }
});

// Publicar imagem no feed do Instagram
router.post("/instagram/publicar", async (req, res) => {
  const { imageUrl, caption } = req.body;

  try {
    const createUrl = `https://graph.facebook.com/v19.0/${INSTAGRAM_BUSINESS_ID}/media`;
    const createResp = await axios.post(createUrl, {
      image_url: imageUrl,
      caption,
      access_token: INSTAGRAM_TOKEN,
    });

    const creationId = createResp.data.id;

    const publishUrl = `https://graph.facebook.com/v19.0/${INSTAGRAM_BUSINESS_ID}/media_publish`;
    const publishResp = await axios.post(publishUrl, {
      creation_id: creationId,
      access_token: INSTAGRAM_TOKEN,
    });

    return res.status(200).json({ message: "Imagem publicada com sucesso!", result: publishResp.data });
  } catch (error) {
    console.error("Erro ao publicar imagem:", error.response?.data || error.message);
    return res.status(500).json({ error: "Erro ao publicar imagem no Instagram" });
  }
});

module.exports = router; // ✅ exportando como router
