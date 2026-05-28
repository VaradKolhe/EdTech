import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  addModule,
  updateModule,
  deleteModule,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect, authorizeRoles("instructor", "admin"));

router.post("/", addModule);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

export default router;
