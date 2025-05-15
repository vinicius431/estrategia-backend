const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// 🔐 Configurando autenticação
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// 📦 Armazenamento configurado para imagem/vídeo
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "estrategia_uploads",
      resource_type: "auto", // aceita imagens e vídeos
      public_id: `${Date.now()}-${file.originalname}`, // nome único
    };
  },
});

module.exports = { cloudinary, storage };
