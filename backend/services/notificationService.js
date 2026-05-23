import Notification from "../models/Notification.js";

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  relatedCourseId,
  relatedEnrollmentId,
  relatedCertificateId,
}) =>
  Notification.create({
    userId,
    title,
    message,
    type,
    relatedCourseId,
    relatedEnrollmentId,
    relatedCertificateId,
  }).catch(() => null);

export const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { returnDocument: "after" }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update notification" });
  }
};
