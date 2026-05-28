import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadCourseVideo } from "../middleware/uploadMiddleware.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  getCourseOutline,
  getSubmoduleContent,
  getInstructorStats,
  addSubmodule,
  saveCourseContent,
  updateCourse,
  uploadVideoContent,
} from "../controllers/courseController.js";
import { getCourseRatings } from "../controllers/studentController.js";

const router = express.Router();

router.use(protect, authorizeRoles("instructor", "admin"));

router.get("/stats", getInstructorStats);
router.get("/courses", getCourses);
router.post("/courses", createCourse);
router.get("/courses/:id", getCourseById);
router.put("/courses/:id", updateCourse);
router.put("/courses/:courseId/content", saveCourseContent);
router.get("/courses/:courseId/outline", getCourseOutline);
router.get("/courses/:courseId/ratings", getCourseRatings);
router.get(
  "/courses/:courseId/modules/:moduleId/submodules/:submoduleId/content",
  getSubmoduleContent
);
router.post(
  "/courses/:courseId/modules/:moduleId/submodules",
  addSubmodule
);
router.post(
  "/courses/:courseId/modules/:moduleId/submodules/:submoduleId/upload-video",
  uploadCourseVideo.single("video"),
  uploadVideoContent
);

router.post(
  "/courses/draft/upload-video",
  uploadCourseVideo.single("video"),
  uploadVideoContent
);

export default router;
