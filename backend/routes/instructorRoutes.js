import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  getCourseOutline,
  getSubmoduleContent,
  getInstructorStats,
  saveCourseContent,
  updateCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect, authorizeRoles("instructor", "admin"));

router.get("/stats", getInstructorStats);
router.get("/courses", getCourses);
router.post("/courses", createCourse);
router.get("/courses/:id", getCourseById);
router.put("/courses/:id", updateCourse);
router.put("/courses/:courseId/content", saveCourseContent);
router.get("/courses/:courseId/outline", getCourseOutline);
router.get(
  "/courses/:courseId/modules/:moduleId/submodules/:submoduleId/content",
  getSubmoduleContent
);

export default router;
