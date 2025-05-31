const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const INSTAGRAM_TOKEN = process.env.TOKEN_DE_60_DIAS;
const INSTAGRAM_BUSINESS_ID = "17841474725070928";

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

module.exports = router;
