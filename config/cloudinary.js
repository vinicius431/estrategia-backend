const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Agora aceita imagens E vídeos
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "estrategia_uploads",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "mov", "avi"],
    };
  },
});

module.exports = { cloudinary, storage };
