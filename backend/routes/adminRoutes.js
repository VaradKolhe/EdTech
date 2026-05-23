import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadCertificate } from "../middleware/uploadMiddleware.js";
import { getPlatformStats, getReports } from "../controllers/admin/statsController.js";
import {
  getInstructors,
  updateInstructorVerification,
  deleteInstructor,
} from "../controllers/admin/instructorsController.js";
import { getStudents, deleteStudent } from "../controllers/admin/studentsController.js";
import { getCourses, deleteCourse } from "../controllers/admin/coursesController.js";
import { getFeedbackAnalytics } from "../controllers/admin/feedbackController.js";
import {
  getCertificates,
  uploadCertificate as uploadCertificateHandler,
  setDefaultCertificate,
  updateCertificateStatus,
  deleteCertificate,
} from "../controllers/admin/certificatesController.js";
import {
  removeUser,
  removeCourse,
} from "../controllers/admin/moderationController.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/stats", getPlatformStats);
router.get("/reports", getReports);

router.get("/instructors", getInstructors);
router.patch("/instructors/:id/verification", updateInstructorVerification);
router.delete("/instructors/:id", deleteInstructor);

router.get("/students", getStudents);
router.delete("/students/:id", deleteStudent);

router.get("/courses", getCourses);
router.delete("/courses/:id", deleteCourse);

router.get("/feedback/analytics", getFeedbackAnalytics);

router.get("/certificates", getCertificates);
router.post(
  "/certificates/upload",
  uploadCertificate.single("file"),
  uploadCertificateHandler
);
router.patch("/certificates/:id/default", setDefaultCertificate);
router.patch("/certificates/:id/status", updateCertificateStatus);
router.delete("/certificates/:id", deleteCertificate);

router.delete("/moderation/users/:id", removeUser);
router.delete("/moderation/courses/:id", removeCourse);

export default router;
