const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// ✅ Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ✅ Configuração do Storage para Imagens e Vídeos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "estrategia_uploads",
      resource_type: isVideo ? "video" : "image",
      format: isVideo ? "mp4" : "jpg",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi", "mkv"],
      public_id: `${Date.now()}-${file.originalname}`, // Nome único para cada arquivo
    };
  },
});

module.exports = { cloudinary, storage };
