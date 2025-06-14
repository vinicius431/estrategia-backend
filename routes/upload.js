const express = require("express");
const multer = require("multer");
const { cloudinary, storage } = require("../config/cloudinary");

const router = express.Router();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado." });
    }

    res.json({ url: req.file.path }); // Já vem com a URL do Cloudinary
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ erro: "Erro no upload da mídia." });
  }
});

module.exports = router;
