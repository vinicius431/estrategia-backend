const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "estrategia_uploads",
      resource_type: "auto", // Detecta automaticamente o tipo de arquivo (imagem ou vídeo)
      format: isVideo ? "mp4" : "jpg", // Formato padrão para vídeo e imagem
      allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "mov", "avi", "mkv"],
      public_id: `${Date.now()}-${file.originalname}`, // Nome único para cada arquivo
    };
  },
});

module.exports = { cloudinary, storage };
