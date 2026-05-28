import Course from "../../models/Course.js";

export const getCourses = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { "description.en": { $regex: search, $options: "i" } },
      ];
    }
    const courses = await Course.find(filter)
      .populate("instructorId", "name email")
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 });
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch courses" });
  }
};

export const getPendingReviewCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "PENDING_REVIEW" })
      .populate("instructorId", "name email")
      .populate("categoryId", "name slug")
      .sort({ submittedAt: 1 });
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch pending courses" });
  }
};

export const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.status !== "PENDING_REVIEW") {
      return res.status(400).json({ message: "Course is not in pending review state" });
    }

    course.status = "PAYMENT_PENDING";
    course.reviewedAt = new Date();
    course.reviewedBy = req.user._id;
    await course.save();

    res.json({ message: "Course approved. Awaiting platform fee payment.", course });
  } catch (error) {
    res.status(500).json({ message: error.message || "Approval failed" });
  }
};

export const rejectCourse = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Rejection reason is required" });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.status !== "PENDING_REVIEW") {
      return res.status(400).json({ message: "Course is not in pending review state" });
    }

    course.status = "REJECTED";
    course.rejectionReason = reason;
    course.reviewedAt = new Date();
    course.reviewedBy = req.user._id;
    await course.save();

    res.json({ message: "Course rejected", course });
  } catch (error) {
    res.status(500).json({ message: error.message || "Rejection failed" });
  }
};

export const archiveCourse = async (req, res) => {
  try {
    const { reason } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.status = "ARCHIVED";
    course.archivedAt = new Date();
    course.archivedBy = req.user._id;
    course.archiveReason = reason || "No reason provided";
    await course.save();

    res.json({ message: "Course archived", course });
  } catch (error) {
    res.status(500).json({ message: error.message || "Archive failed" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "ARCHIVED" },
      { returnDocument: "after" }
    ).populate("instructorId", "name email");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course removed", course });
  } catch (error) {
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};
