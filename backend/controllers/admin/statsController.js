import User from "../../models/User.js";
import Course from "../../models/Course.js";
import Rating from "../../models/Rating.js";

export const getPlatformStats = async (_req, res) => {
  try {
    const [
      totalStudents,
      totalInstructors,
      totalCourses,
      pendingVerifications,
      totalRatings,
      avgRatingAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "student", isActive: true }),
      User.countDocuments({ role: "instructor", isActive: true }),
      Course.countDocuments(),
      User.countDocuments({
        role: "instructor",
        "instructorProfile.verification.status": "PENDING",
        isActive: true,
      }),
      Rating.countDocuments(),
      Rating.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
    ]);

    const averageRating =
      avgRatingAgg[0]?.avg != null
        ? Number(avgRatingAgg[0].avg.toFixed(2))
        : 0;

    res.json({
      totalStudents,
      totalInstructors,
      totalCourses,
      pendingVerifications,
      totalRatings,
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
        { $match: { isActive: true } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Rating.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avg: { $avg: "$rating" },
          },
        },
      ]),
      Course.aggregate([
        { $match: {} },
        {
          $group: {
            _id: "$categoryId",
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
