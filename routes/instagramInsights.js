const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_ultra_forte";

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

router.get("/insights", autenticarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId);
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

   const token = usuario.instagramAccessToken;
   const businessId = usuario.instagramBusinessId;

if (!token || !businessId) {
  return res.status(400).json({ erro: "Instagram não conectado." });
}

const url = `https://graph.facebook.com/v19.0/${businessId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${token}`;
 
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (!resposta.ok) {
      return res.status(500).json({ erro: "Erro ao buscar insights", detalhes: dados });
    }

    res.json(dados);
  } catch (err) {
    console.error("Erro ao buscar insights:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

module.exports = router;
