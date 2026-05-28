import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

/**
 * Checks if a user has access to a course and its internal content.
 * Returns an access object with flags.
 * @param {Object} user - The req.user object
 * @param {string|Object} courseOrId - The course document or ID
 * @returns {Object} { allowed, hasPreviewAccess, isLocked, enrollment, access, course }
 */
export const checkCourseAccess = async (user, courseOrId) => {
  if (!user) return { allowed: false, status: 401, message: "Unauthorized" };
  if (!courseOrId) return { allowed: false, status: 400, message: "Course ID missing" };

  let course = courseOrId;
  if (typeof courseOrId === "string" || mongoose.Types.ObjectId.isValid(courseOrId)) {
    course = await Course.findById(courseOrId).populate([
      { path: "instructorId", select: "name email instructorProfile" },
      { path: "categoryId", select: "name slug" },
    ]);
  }

  if (!course) return { allowed: false, status: 404, message: "Course not found" };

  const isAdmin = user.role === "admin";
  const instructorId = course.instructorId?._id || course.instructorId;
  const isInstructor = String(instructorId) === String(user._id);
  const hasPreviewAccess = isAdmin || isInstructor;

  // Access rules:
  // 1. Admin/Instructor: Full access to any course they own or all courses (admin)
  // 2. Student: Only PUBLISHED courses, and must be enrolled for full content
  
  if (user.role === "student" && course.status !== "PUBLISHED") {
    return { allowed: false, status: 403, message: "This course is not available for preview." };
  }

  const enrollment = await Enrollment.findOne({
    userId: user._id,
    courseId: course._id,
    accessStatus: "ACTIVE",
    status: { $in: ["ENROLLED", "COMPLETED"] },
  });

  const canAccessContent = hasPreviewAccess || !!enrollment;
  const isLocked = course.isPaid && !enrollment && !hasPreviewAccess;

  return {
    allowed: canAccessContent,
    hasPreviewAccess,
    isLocked,
    enrollment,
    course,
    access: {
      isAdminPreview: isAdmin,
      isOwnerPreview: isInstructor,
      isEnrolled: !!enrollment,
      canAccessContent,
    },
  };
};
