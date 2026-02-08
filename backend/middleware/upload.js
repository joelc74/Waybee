const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "public", "images");

// Asegura que exista la carpeta
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ext a partir del mimetype
    const ext =
      file.mimetype === "image/jpeg" ? "jpg" :
      file.mimetype === "image/png"  ? "png" :
      file.mimetype === "image/gif"  ? "gif" :
      "bin";

    const safeName = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Formato no permitido. Solo JPG/PNG/GIF."), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
