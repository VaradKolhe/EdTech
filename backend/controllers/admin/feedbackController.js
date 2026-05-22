import Feedback from "../../models/Feedback.js";
import Course from "../../models/Course.js";

export const getFeedbackAnalytics = async (_req, res) => {
  try {
    const [avgAgg, totalCount, courseWise] = await Promise.all([
      Feedback.aggregate([
        { $group: { _id: null, average: { $avg: "$rating" } } },
      ]),
      Feedback.countDocuments(),
      Feedback.aggregate([
        {
          $group: {
            _id: "$course",
            averageRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const courseIds = courseWise.map((c) => c._id);
    const courses = await Course.find({ _id: { $in: courseIds } }).select(
      "title"
    );
    const titleMap = Object.fromEntries(
      courses.map((c) => [c._id.toString(), c.title])
    );

    res.json({
      averageRating: Number((avgAgg[0]?.average ?? 0).toFixed(2)),
      totalFeedback: totalCount,
      courseWiseRatings: courseWise.map((row) => ({
        courseId: row._id,
        courseTitle: titleMap[row._id?.toString()] || "Unknown Course",
        averageRating: Number(row.averageRating.toFixed(2)),
        count: row.count,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch feedback analytics",
    });
  }
};
