const express = require("express");
const router = express.Router();
const { createCourse, getCourses, getCourseById } = require("../controllers/courseController");

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);

module.exports = router;
