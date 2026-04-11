const path = require("path");
const fs = require("fs");

const getImage = (req, res) => {
  const { filename } = req.params;

  const safeName = path.basename(filename);
  const imagePath = path.join(__dirname, "../../public/images", safeName);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: "Imagen no encontrada" });
  }

  const ext = path.extname(safeName).toLowerCase();
  const mimeTypes = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".ico": "image/x-icon"
  };

  const contentType = mimeTypes[ext];
  if (!contentType) {
    return res.status(400).json({ error: "Tipo de archivo no soportado" });
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000");

  fs.createReadStream(imagePath).pipe(res);
};

module.exports = { getImage };
