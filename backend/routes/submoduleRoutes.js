import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { updateSubmoduleBlocks } from "../controllers/courseController.js";

const router = express.Router();

router.use(protect, authorizeRoles("instructor", "admin"));

router.put("/:id/blocks", updateSubmoduleBlocks);

export default router;
