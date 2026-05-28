import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  saveCourseContent,
  submitCourseForReview,
  createPlatformFeeOrder,
  verifyPlatformFee,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect, authorizeRoles("instructor", "admin"));

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.put("/:courseId/content", saveCourseContent);

// Approval & Payment Workflow
router.patch("/:id/submit-review", submitCourseForReview);
router.post("/:courseId/platform-fee/order", createPlatformFeeOrder);
router.post("/:courseId/platform-fee/verify", verifyPlatformFee);

export default router;
