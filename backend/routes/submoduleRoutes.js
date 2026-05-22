import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createSubmodule,
  updateSubmodule,
  deleteSubmodule,
  getSubmoduleContent,
  addContent,
  addQuiz,
  saveBlocks,
  addBlock,
} from "../controllers/submoduleController.js";

const router = express.Router();

router.use(protect, authorizeRoles("teacher", "admin"));

router.post("/", createSubmodule);
router.put("/:id", updateSubmodule);
router.delete("/:id", deleteSubmodule);
router.get("/:id/content", getSubmoduleContent);
router.put("/:id/blocks", saveBlocks);
router.post("/:id/blocks", addBlock);
router.post("/content", addContent);
router.post("/quiz", addQuiz);

export default router;
