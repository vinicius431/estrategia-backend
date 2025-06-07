const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_ultra_forte";

// Middleware para autenticação
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

// Rota para buscar insights da Página do Facebook
router.get("/insights", autenticarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId);
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

    const token = usuario.paginaAccessToken; // 🔑 token correto
    const pageId = usuario.facebookPageId;   // 📘 ID da página do Facebook

    if (!token || !pageId) {
      return res.status(400).json({ erro: "Página do Facebook não conectada." });
    }

    const url = `https://graph.facebook.com/v19.0/${pageId}/insights?metric=page_impressions,page_engaged_users&period=day&access_token=${token}`;
    console.log("📡 Requisição para insights da página:", url);

    const resposta = await fetch(url);
    const text = await resposta.text();

    let dados;
    try {
      dados = JSON.parse(text);
    } catch (jsonErr) {
      console.error("❌ JSON malformado:", text);
      return res.status(500).json({ erro: "Resposta inválida da API do Facebook", detalhes: text });
    }

    if (!resposta.ok) {
      return res.status(resposta.status).json({ erro: "Erro ao buscar insights", detalhes: dados });
    }

    res.json(dados);
  } catch (err) {
    console.error("❌ Erro ao buscar insights:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

module.exports = router;
