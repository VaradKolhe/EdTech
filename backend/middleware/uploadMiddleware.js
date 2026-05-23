import multer from "multer";
import path from "path";
import fs from "fs";

const certDir = path.join(process.cwd(), "uploads", "certificates");
const verifyDir = path.join(process.cwd(), "uploads", "verification");
fs.mkdirSync(certDir, { recursive: true });
fs.mkdirSync(verifyDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = req.path.includes("verification") ? verifyDir : certDir;
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype.split("/")[1] || file.mimetype || "");
  if (ext || mime) cb(null, true);
  else cb(new Error("Only image or PDF files are allowed"));
};

export const uploadCertificate = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const uploadVerification = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});
