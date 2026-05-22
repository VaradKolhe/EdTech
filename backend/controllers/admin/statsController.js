import User from "../../models/User.js";
import Course from "../../models/Course.js";
import Feedback from "../../models/Feedback.js";

export const getPlatformStats = async (_req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      pendingVerifications,
      totalFeedback,
      avgRatingAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "student", isDeleted: false }),
      User.countDocuments({ role: "teacher", isDeleted: false }),
      Course.countDocuments({ isDeleted: false }),
      User.countDocuments({
        role: "teacher",
        verificationStatus: "pending",
        isDeleted: false,
      }),
      Feedback.countDocuments(),
      Feedback.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
    ]);

    const averageRating =
      avgRatingAgg[0]?.avg != null
        ? Number(avgRatingAgg[0].avg.toFixed(2))
        : 0;

    res.json({
      totalStudents,
      totalTeachers,
      totalCourses,
      pendingVerifications,
      totalFeedback,
      averageRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch stats" });
  }
};

export const getReports = async (_req, res) => {
  try {
    const [userCounts, feedbackStats, courseStats] = await Promise.all([
      User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avg: { $avg: "$rating" },
          },
        },
      ]),
      Course.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            avgPrice: { $avg: "$price" },
          },
        },
      ]),
    ]);

    res.json({
      userCounts: userCounts.reduce((acc, u) => {
        acc[u._id] = u.count;
        return acc;
      }, {}),
      feedback: {
        total: feedbackStats[0]?.total ?? 0,
        averageRating: Number((feedbackStats[0]?.avg ?? 0).toFixed(2)),
      },
      courseStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch reports" });
  }
};
