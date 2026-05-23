import express from "express";
import {
  registerStudent,
  registerInstructor,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  submitVerification,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadVerification } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register/student", registerStudent);
router.post("/student/register", registerStudent);
router.post("/register/instructor", registerInstructor);
router.post("/register/teacher", registerInstructor);
router.post("/login", login);

router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);
router.post("/verification/submit", protect, uploadVerification.array("files", 5), submitVerification);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
