// middleware/uploadPostFiles.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Carpetas de destino
const mediaDir = path.join(__dirname, "../uploads");
const snapshotDir = path.join(__dirname, "../uploads/snapshotMap");

// Crear carpetas si no existen
[mediaDir, snapshotDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 🔹 Storage para multimedia
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `media-${uniqueSuffix}${ext}`);
  },
});

// 🔹 Storage para snapshot
const snapshotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, snapshotDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `snapshot-${uniqueSuffix}${ext}`);
  },
});

// 🔹 File filter: solo imágenes para snapshot, multimedia cualquiera
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "snapshot") {
    // Solo imágenes para snapshot
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Snapshot debe ser una imagen"), false);
  } else {
    // Para media, aceptar todo tipo de archivo
    cb(null, true);
  }
};

// 🔹 Middleware final
const upload = multer({
  storage: (req, file, cb) => {
    if (file.fieldname === "snapshot") cb(null, snapshotStorage);
    else cb(null, mediaStorage);
  },
  fileFilter,
});

export const uploadPostFiles = upload.fields([
  { name: "media", maxCount: 10 },     // varios archivos multimedia
  { name: "snapshot", maxCount: 1 },   // solo una snapshot
]);
