import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Feedback from "../models/Feedback.js";

dotenv.config();

const seedDemoData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const teachers = await User.find({
      role: "teacher",
      isDeleted: false,
    }).limit(3);
    const students = await User.find({
      role: "student",
      isDeleted: false,
    }).limit(5);

    if (teachers.length === 0) {
      console.log("No teachers found. Register teachers first or run seed:admin.");
      process.exit(0);
    }

    const existingCourses = await Course.countDocuments({ isDeleted: false });
    if (existingCourses === 0) {
      const sampleCourses = [
        {
          title: "Introduction to Networking",
          category: "IT",
          language: "English",
          price: 49,
          teacher: teachers[0]._id,
        },
        {
          title: "React Fundamentals",
          category: "Development",
          language: "English",
          price: 39,
          teacher: teachers[0]._id,
        },
        {
          title: "Cybersecurity Essentials",
          category: "Security",
          language: "English",
          price: 59,
          teacher: teachers[teachers.length > 1 ? 1 : 0]._id,
        },
        {
          title: "Data Science with Python",
          category: "Data",
          language: "English",
          price: 69,
          teacher: teachers[teachers.length > 2 ? 2 : 0]._id,
        },
      ];
      const created = await Course.insertMany(sampleCourses);
      console.log(`Seeded ${created.length} courses`);

      if (students.length > 0) {
        const feedbackData = created.flatMap((course, i) =>
          students.slice(0, 2).map((student, j) => ({
            course: course._id,
            student: student._id,
            rating: 3 + ((i + j) % 3),
            comment: "Great course content and structure.",
          }))
        );
        await Feedback.insertMany(feedbackData);
        console.log(`Seeded ${feedbackData.length} feedback entries`);
      }

      await User.updateMany(
        { role: "student", isDeleted: false },
        { $set: { enrolledCourseCount: 2 } }
      );
    } else {
      console.log("Courses already exist, skipping demo seed.");
    }

    console.log("Demo data seed complete.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedDemoData();
