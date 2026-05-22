import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/moduleController.js";

const router = express.Router();

router.use(protect, authorizeRoles("teacher", "admin"));

router.post("/", createModule);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

export default router;
