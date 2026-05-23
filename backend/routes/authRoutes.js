import express from "express";
import {
  registerStudent,
  registerInstructor,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register/student", registerStudent);
router.post("/student/register", registerStudent);
router.post("/register/instructor", registerInstructor);
router.post("/register/teacher", registerInstructor);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
