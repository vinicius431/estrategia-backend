const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  plano: { type: String, default: "Free" },
  criadoEm: { type: Date, default: Date.now },

  // Campos da integração com o Instagram
  instagramAccessToken: String,
  instagramBusinessId: String,
  facebookPageId: String,
  instagramName: String,
  tokenExpiresAt: Date,
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
