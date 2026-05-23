import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { assistModule } from "../controllers/aiController.js";

const router = express.Router();

// Only authenticated users can access AI features
router.post("/module-assist", protect, assistModule);

export default router;
