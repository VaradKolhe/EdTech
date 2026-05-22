import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createCourse,
  getCourses,
  getCourseById,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect, authorizeRoles("teacher", "admin"));

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);

export default router;
