import request from "supertest";
import app from "../server.js";
import { connect, close, clear } from "./setup.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Category from "../models/Category.js";
import Enrollment from "../models/Enrollment.js";
import Rating from "../models/Rating.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

beforeAll(async () => await connect());
afterEach(async () => await clear());
afterAll(async () => await close());

describe("Module 7: Feedback & Analytics", () => {
  const setup = async () => {
    const student = await User.create({ name: "Student", email: "stud@example.com", password: "Password123!", role: "student" });
    const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET || "secret");
    const admin = await User.create({ name: "Admin", email: "admin@example.com", password: "Password123!", role: "admin" });
    const adminToken = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET || "secret");
    
    const cat = await Category.create({ name: { en: "Test" }, slug: "test" });
    const course = await Course.create({ title: { en: "Course" }, instructorId: new mongoose.Types.ObjectId(), categoryId: cat._id, difficulty: "Beginner" });
    
    return { student, token, adminToken, course };
  };

  test("TC-33: Student submits valid course feedback", async () => {
    const { student, token, course } = await setup();
    await Enrollment.create({ userId: student._id, courseId: course._id, accessStatus: "ACTIVE" });

    const res = await request(app)
      .post(`/api/student/courses/${course._id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5, review: "Great!" });

    expect(res.status).toBe(200);
    expect(res.body.rating.rating).toBe(5);
  });

  test("TC-34: Duplicate feedback submission by same student", async () => {
    const { student, token, course } = await setup();
    await Enrollment.create({ userId: student._id, courseId: course._id, accessStatus: "ACTIVE" });

    await request(app)
      .post(`/api/student/courses/${course._id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5, review: "Great!" });

    // Submission logic typically updates existing rating (upsert)
    // If requirement is to block duplicate, it should fail. 
    // Currently, it uses findOneAndUpdate with upsert.
    const res = await request(app)
      .post(`/api/student/courses/${course._id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 4, review: "Update" });

    expect(res.status).toBe(200); // Updated successfully
    const ratings = await Rating.find({ userId: student._id, courseId: course._id });
    expect(ratings.length).toBe(1); 
  });

  test("TC-35: Feedback submitted with empty comment and no rating", async () => {
    const { student, token, course } = await setup();
    await Enrollment.create({ userId: student._id, courseId: course._id, accessStatus: "ACTIVE" });

    const res = await request(app)
      .post(`/api/student/courses/${course._id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: null });

    expect(res.status).toBe(400);
  });

  test("TC-36: Admin views analytics dashboard", async () => {
    const { adminToken } = await setup();
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalStudents).toBeDefined();
  });
});
