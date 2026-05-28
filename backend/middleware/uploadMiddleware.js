import multer from "multer";
import path from "path";
import fs from "fs";

const certDir = path.join(process.cwd(), "uploads", "certificates");
const verifyDir = path.join(process.cwd(), "uploads", "verification");
const courseVideoDir = path.join(process.cwd(), "uploads", "courses");

fs.mkdirSync(certDir, { recursive: true });
fs.mkdirSync(verifyDir, { recursive: true });
fs.mkdirSync(courseVideoDir, { recursive: true });

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

// Video Upload
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir;
    if (req.params.courseId && req.params.courseId !== "draft") {
      const courseId = req.params.courseId;
      const moduleId = req.params.moduleId || "unknown_module";
      const submoduleId = req.params.submoduleId || "unknown_submodule";
      dir = path.join(courseVideoDir, `course_${courseId}`, `modules`, `module_${moduleId}`, `submodules`, `submodule_${submoduleId}`, "videos");
    } else {
      const teacherId = req.user ? req.user._id : "unknown_teacher";
      const timestamp = Date.now();
      dir = path.join(process.cwd(), "uploads", "temp", `teacher_${teacherId}`, `draft_${timestamp}`);
    }
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const uploadCourseVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB Limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are allowed"));
  },
});
