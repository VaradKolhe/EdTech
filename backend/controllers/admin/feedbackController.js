import Rating from "../../models/Rating.js";
import Course from "../../models/Course.js";

export const getFeedbackAnalytics = async (_req, res) => {
  try {
    const [avgAgg, totalCount, courseWise] = await Promise.all([
      Rating.aggregate([{ $group: { _id: null, average: { $avg: "$rating" } } }]),
      Rating.countDocuments(),
      Rating.aggregate([
        {
          $group: {
            _id: "$courseId",
            averageRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const courses = await Course.find({ _id: { $in: courseWise.map((c) => c._id) } }).select("title");
    const titleMap = Object.fromEntries(courses.map((c) => [String(c._id), c.title?.en || "Untitled course"]));

    res.json({
      averageRating: Number((avgAgg[0]?.average ?? 0).toFixed(2)),
      totalFeedback: totalCount,
      totalRatings: totalCount,
      courseWiseRatings: courseWise.map((row) => ({
        courseId: row._id,
        courseTitle: titleMap[String(row._id)] || "Unknown Course",
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
