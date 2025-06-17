const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  telefone: { type: String },
  nascimento: { type: String },
  sexo: { type: String },
  plano: { type: String, default: "Free" },

  // 🔗 Integração com Instagram/Facebook
  instagramAccessToken: { type: String },
  facebookPageId: { type: String },
  tokenExpiresAt: { type: Date },
  instagramName: { type: String }, // ✅ Nome do perfil do Instagram conectado
  paginaAccessToken: String,
  instagramBusinessId: String,

  // ✅ Campos de controle de uso por plano
  agendamentosUsadosMes: { type: Number, default: 0 },
  iaInputsHoje: { type: Number, default: 0 },
  hashtagsHoje: { type: Number, default: 0 }
});

module.exports = mongoose.model("Usuario", usuarioSchema);

