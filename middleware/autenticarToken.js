// middleware/autenticarToken.js
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_ultra_forte";

async function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 🚀 Aqui faz toda a diferença:
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({ erro: "Usuário não encontrado." });
    }

    req.usuario = usuario;    // ✅ O objeto completo!
    req.usuarioId = decoded.id;

    next();
  } catch (err) {
    console.error("Erro na autenticação:", err);
    return res.status(403).json({ erro: "Token inválido ou expirado." });
  }
}

module.exports = autenticarToken;
