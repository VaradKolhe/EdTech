import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  saveCourseContent,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect, authorizeRoles("instructor", "admin"));

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.put("/:courseId/content", saveCourseContent);

export default router;
