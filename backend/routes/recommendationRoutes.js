import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createRecommendationFeedback,
  getDashboardRecommendations,
  searchRecommendations,
  getSimilarCourses,
} from "../controllers/studentController.js";

const router = express.Router();

router.use(protect, authorizeRoles("student", "admin"));

router.get("/dashboard/:userId", getDashboardRecommendations);
router.get("/search", searchRecommendations);
router.get("/similar/:courseId", getSimilarCourses);
router.post("/feedback", createRecommendationFeedback);

export default router;
