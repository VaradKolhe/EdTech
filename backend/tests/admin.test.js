import request from "supertest";
import app from "../server.js";
import { connect, close, clear } from "./setup.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Category from "../models/Category.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

beforeAll(async () => await connect());
afterEach(async () => await clear());
afterAll(async () => await close());

describe("Module 9: Admin Monitoring", () => {
  const getAdminToken = async () => {
    const admin = await User.create({ name: "Admin", email: "admin@example.com", password: "Password123!", role: "admin" });
    return jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET || "secret");
  };

  test("TC-41: Admin moderates and rejects a policy-violating course", async () => {
    const token = await getAdminToken();
    const cat = await Category.create({ name: { en: "Test" }, slug: "test" });
    const course = await Course.create({ title: { en: "Bad Course" }, instructorId: new mongoose.Types.ObjectId(), categoryId: cat._id, difficulty: "Beginner" });

    const res = await request(app)
      .patch(`/api/admin/courses/${course._id}/archive`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Policy violation" });

    if (res.status !== 200) console.error("TC-41 Error:", res.body);
    expect(res.status).toBe(200);
    const updated = await Course.findById(course._id);
    expect(updated.status).toBe("ARCHIVED");
  });

  test("TC-42: Admin deactivates a student account", async () => {
    const token = await getAdminToken();
    const student = await User.create({ name: "Student", email: "stud@example.com", password: "Password123!", role: "student" });

    const res = await request(app)
      .delete(`/api/admin/students/${student._id}`)
      .set("Authorization", `Bearer ${token}`);

    if (res.status !== 200) console.error("TC-42 Error:", res.body);
    expect(res.status).toBe(200);
    const updated = await User.findById(student._id);
    expect(updated.isActive).toBe(false);
  });

  test("TC-43: Admin verifies and approves a teacher account", async () => {
    const token = await getAdminToken();
    const instructor = await User.create({ name: "Inst", email: "i@ex.com", password: "Password123!", role: "instructor", instructorProfile: { verification: { status: "PENDING" } } });

    const res = await request(app)
      .patch(`/api/admin/instructors/${instructor._id}/verification`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "APPROVED" });

    expect(res.status).toBe(200);
    expect(res.body.instructor.instructorProfile.verification.status).toBe("APPROVED");
  });

  test("TC-44: Non-admin user accesses admin panel", async () => {
    const student = await User.create({ name: "Student", email: "stud@example.com", password: "Password123!", role: "student" });
    const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET || "secret");

    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
