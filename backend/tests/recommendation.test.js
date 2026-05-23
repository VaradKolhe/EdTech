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

describe("Module 3: Recommendation System", () => {
  const getTokens = async () => {
    const student = await User.create({ name: "Student", email: "stud@example.com", password: "Password123!", role: "student" });
    const newUser = await User.create({ name: "New User", email: "new@example.com", password: "Password123!", role: "student" });

    return {
      student: { id: student._id, token: jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET || "secret") },
      newUser: { id: newUser._id, token: jwt.sign({ id: newUser._id, role: "student" }, process.env.JWT_SECRET || "secret") },
    };
  };

  test("TC-14: Personalized recommendation for active user", async () => {
    const { student } = await getTokens();
    const cat = await Category.create({ name: { en: "Programming" }, slug: "programming" });
    await Course.create({ title: { en: "React" }, categoryId: cat._id, status: "PUBLISHED", instructorId: new mongoose.Types.ObjectId(), difficulty: "Beginner" });

    const res = await request(app)
      .get(`/api/recommendations/dashboard/${student.id}`)
      .set("Authorization", `Bearer ${student.token}`);

    expect(res.status).toBe(200);
    expect(res.body.recommendations).toBeDefined();
  });

  test("TC-15: Cold-start recommendations for new user with no history", async () => {
    const { newUser } = await getTokens();
    const cat = await Category.create({ name: { en: "Programming" }, slug: "programming" });
    await Course.create({ title: { en: "Intro" }, categoryId: cat._id, status: "PUBLISHED", instructorId: new mongoose.Types.ObjectId(), difficulty: "Beginner" });

    const res = await request(app)
      .get(`/api/recommendations/dashboard/${newUser.id}`)
      .set("Authorization", `Bearer ${newUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.recommendations.length).toBeGreaterThan(0);
  });

  test("TC-16: Search-based course recommendation", async () => {
    const { student } = await getTokens();
    const cat = await Category.create({ name: { en: "Programming" }, slug: "programming" });
    await Course.create({ title: { en: "Python" }, categoryId: cat._id, status: "PUBLISHED", instructorId: new mongoose.Types.ObjectId(), difficulty: "Beginner" });

    const res = await request(app)
      .get("/api/recommendations/search?query=Python")
      .set("Authorization", `Bearer ${student.token}`);

    expect(res.status).toBe(200);
    expect(res.body.courses.length).toBeGreaterThan(0);
  });

  test("TC-17: Search query returns no results", async () => {
    const { student } = await getTokens();
    const res = await request(app)
      .get("/api/recommendations/search?query=NonExistentCourse123")
      .set("Authorization", `Bearer ${student.token}`);

    expect(res.status).toBe(200);
    expect(res.body.courses.length).toBe(0);
  });

  test("TC-18: Recommendation with only 1 enrolled course", async () => {
    const { student } = await getTokens();
    const cat = await Category.create({ name: { en: "Programming" }, slug: "programming-18" });
    await Course.create({ title: { en: "Course 1" }, categoryId: cat._id, status: "PUBLISHED", instructorId: new mongoose.Types.ObjectId(), difficulty: "Beginner" });
    await Course.create({ title: { en: "Course 2" }, categoryId: cat._id, status: "PUBLISHED", instructorId: new mongoose.Types.ObjectId(), difficulty: "Beginner" });

    const res = await request(app)
      .get(`/api/recommendations/dashboard/${student.id}`)
      .set("Authorization", `Bearer ${student.token}`);

    expect(res.status).toBe(200);
  });
});
