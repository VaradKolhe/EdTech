import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createRecommendationFeedback,
  getDashboardRecommendations,
  searchRecommendations,
} from "../controllers/studentController.js";

const router = express.Router();

router.use(protect, authorizeRoles("student", "admin"));

router.get("/dashboard/:userId", getDashboardRecommendations);
router.get("/search", searchRecommendations);
router.post("/feedback", createRecommendationFeedback);

export default router;
