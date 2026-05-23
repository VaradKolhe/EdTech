import User from "../../models/User.js";
import Course from "../../models/Course.js";

const instructorFilter = (search, status) => {
  const filter = { role: "instructor", isActive: true };
  if (status) filter["instructorProfile.verification.status"] = status.toUpperCase();
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { "instructorProfile.expertise": { $regex: search, $options: "i" } },
    ];
  }
  return filter;
};

export const getInstructors = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;
    const instructors = await User.find(instructorFilter(search, status))
      .select("-passwordHash")
      .sort({ createdAt: -1 });
    res.json({ instructors });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch instructors" });
  }
};

export const updateInstructorVerification = async (req, res) => {
  try {
    const { status } = req.body;
    const nextStatus = String(status || "").toUpperCase();
    if (!["APPROVED", "REJECTED", "PENDING", "NOT_APPLIED"].includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }
    const instructor = await User.findOneAndUpdate(
      { _id: req.params.id, role: "instructor", isActive: true },
      {
        "instructorProfile.verification.status": nextStatus,
        "instructorProfile.verification.reviewedBy": req.user._id,
        "instructorProfile.verification.reviewedAt": new Date(),
      },
      { returnDocument: "after" }
    ).select("-passwordHash");
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    res.json({ message: `Instructor ${nextStatus}`, instructor });
  } catch (error) {
    res.status(500).json({ message: error.message || "Update failed" });
  }
};

export const deleteInstructor = async (req, res) => {
  try {
    const instructor = await User.findOneAndUpdate(
      { _id: req.params.id, role: "instructor" },
      { isActive: false },
      { returnDocument: "after" }
    ).select("-passwordHash");
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    await Course.updateMany({ instructorId: instructor._id }, { status: "ARCHIVED" });
    res.json({ message: "Instructor removed", instructor });
  } catch (error) {
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};
