const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_ultra_forte";

// 🔐 Middleware para autenticar token JWT
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ erro: "Token não fornecido" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token malformado" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ erro: "Token inválido" });
    req.usuarioId = decoded.id;
    next();
  });
}

// 📊 Rota para buscar insights reais do Instagram Business
router.get("/insights", autenticarToken, async (req, res) => {
  console.log("🚀 Rota /insights foi acionada!");
  try {
    const usuario = await Usuario.findById(req.usuarioId);
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

    const token = usuario.instagramAccessToken;
    const instagramId = usuario.instagramBusinessId;

    console.log("🔐 JWT do usuário:", req.usuarioId);
    console.log("➡️ Token de acesso (paginaAccessToken):", token);
    console.log("➡️ Instagram Business ID:", instagramId);

    if (!token || !instagramId) {
      console.warn("⚠️ Token ou ID do Instagram ausente.");
      return res.status(400).json({ erro: "Instagram não conectado corretamente." });
    }

    const url = `https://graph.facebook.com/v19.0/${instagramId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${token}`;
    console.log("📡 Buscando insights do Instagram em:", url);

    let resposta;
try {
  resposta = await fetch(url);
  console.log("📡 Fetch feita. Status:", resposta.status);
} catch (err) {
  console.error("❌ Erro de conexão com a Meta:", err.message);
  return res.status(500).json({ erro: "Erro ao conectar com a API do Instagram." });
}

let text;
try {
  text = await resposta.text();
  console.log("📩 Resposta bruta da Meta:", text);
} catch (err) {
  console.error("❌ Erro ao ler resposta da Meta:", err.message);
  return res.status(500).json({ erro: "Erro ao ler resposta da Meta." });
}

    console.log("📩 Resposta bruta da Meta:", text);

    // Se a resposta for vazia
    if (!text || !text.trim()) {
      console.error("❌ Resposta vazia da Meta.");
      return res.status(500).json({ erro: "A Meta retornou uma resposta vazia." });
    }

    let dados;
    try {
      dados = JSON.parse(text);
    } catch (jsonErr) {
      console.error("❌ JSON inválido (ao tentar parsear):", text);
      return res.status(500).json({
        erro: "Resposta não estava em formato JSON",
        corpo: text
      });
    }

    if (!resposta.ok) {
      console.error("❌ Erro da API do Instagram:", dados);
      return res.status(resposta.status).json({
        erro: "Erro ao buscar insights do Instagram",
        detalhes: dados,
      });
 
    }

    console.log("✅ Dados de insights processados com sucesso.");
    res.json(dados);
  } catch (err) {
    console.error("❌ Erro inesperado no backend:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

module.exports = router;
