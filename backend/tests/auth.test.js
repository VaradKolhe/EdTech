import request from "supertest";
import app from "../server.js";
import { connect, close, clear } from "./setup.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

beforeAll(async () => await connect());
afterEach(async () => await clear());
afterAll(async () => await close());

describe("Module 1: Authentication & Authorization", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    role: "student",
  };

  test("TC-01: Valid user login with correct credentials", async () => {
    await User.create({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      role: "student",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.token).toBeDefined();
  });

  test("TC-02: Login with incorrect password", async () => {
    await User.create({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      role: "student",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "WrongPassword!" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });

  test("TC-03: Registration with missing required fields", async () => {
    const res = await request(app)
      .post("/api/auth/register/student")
      .send({ email: testUser.email }); // Missing name and password

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/All fields are required/i);
  });

  test("TC-04: Registration with duplicate email", async () => {
    await User.create({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      role: "student",
    });

    const res = await request(app)
      .post("/api/auth/register/student")
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Email already registered/i);
  });

  test("TC-05: Access protected API route without JWT token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Not authorized, no token/i);
  });

  test("TC-06: Access protected route with expired JWT token", async () => {
    const token = jwt.sign({ id: "someid" }, process.env.JWT_SECRET || "secret", { expiresIn: "0s" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Not authorized, token invalid/i);
  });

  test("TC-07: Student tries to access Teacher/Admin endpoint", async () => {
    const student = await User.create({
      name: "Student",
      email: "student@example.com",
      password: "Password123!",
      role: "student",
    });

    const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET || "secret");

    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });
});
