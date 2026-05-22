const express = require("express");
const router = express.Router();
const { createModule, updateModule, deleteModule } = require("../controllers/moduleController");

router.post("/", createModule);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

module.exports = router;
