import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  addSubmodule,
  updateSubmodule,
  deleteSubmodule,
  updateSubmoduleBlocks,
  getSubmoduleBlocks,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect, authorizeRoles("instructor", "admin"));

router.use((req, res, next) => {
  console.log(`DEBUG: SubmoduleRoute: ${req.method} ${req.url}`);
  next();
});

router.get("/", (req, res) => {
  res.json({ message: "Submodules base path" });
});

router.get("/:id/content", getSubmoduleBlocks);
router.post("/", addSubmodule);
router.put("/:id", updateSubmodule);
router.delete("/:id", deleteSubmodule);
router.put("/:id/blocks", updateSubmoduleBlocks);

export default router;
