const express = require("express");
const router = express.Router();
const {
  createSubmodule,
  updateSubmodule,
  deleteSubmodule,
  getSubmoduleContent,
  addContent,
  addQuiz,
  saveBlocks,
  addBlock,
} = require("../controllers/submoduleController");

router.post("/", createSubmodule);
router.put("/:id", updateSubmodule);
router.delete("/:id", deleteSubmodule);
router.get("/:id/content", getSubmoduleContent);
router.put("/:id/blocks", saveBlocks);
router.post("/:id/blocks", addBlock);
router.post("/content", addContent);
router.post("/quiz", addQuiz);

module.exports = router;
