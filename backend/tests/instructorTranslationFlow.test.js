import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { connect, close, clear } from "./setup.js";

jest.unstable_mockModule("../services/awsTranslate.service.js", () => ({
  translateText: jest.fn(async (text, targetLanguage) => `${text}_${targetLanguage}`),
  getTranslateConfig: jest.fn(() => ({
    provider: "aws-translate",
    region: "ap-south-1",
    hasCredentials: true,
  })),
  checkTranslateHealth: jest.fn(async () => ({
    success: true,
    provider: "aws-translate",
    region: "ap-south-1",
    sample: { source: "Hello", hi: "Hello_hi", mr: "Hello_mr" },
  })),
}));

const app = (await import("../server.js")).default;
const User = (await import("../models/User.js")).default;
const Category = (await import("../models/Category.js")).default;
const Course = (await import("../models/Course.js")).default;
const Quiz = (await import("../models/Quiz.js")).default;

beforeAll(async () => await connect());
afterEach(async () => await clear());
afterAll(async () => await close());

const createInstructor = async () => {
  const instructor = await User.create({
    name: "Instructor",
    email: "translate-flow@example.com",
    password: "Password123!",
    role: "instructor",
    instructorProfile: { verification: { status: "APPROVED" } },
  });

  return {
    id: instructor._id,
    token: jwt.sign({ id: instructor._id, role: "instructor" }, process.env.JWT_SECRET || "secret"),
  };
};

describe("Instructor course translation flow", () => {
  test("creates a course with translated course, category, module, submodule, and text block fields", async () => {
    const instructor = await createInstructor();
    const category = await Category.create({
      name: { en: "Programming" },
      description: { en: "Technical courses" },
      slug: "programming",
    });

    const res = await request(app)
      .post("/api/instructor/courses")
      .set("Authorization", `Bearer ${instructor.token}`)
      .send({
        title: { en: "Python Basics" },
        description: { en: "Learn Python step by step." },
        categoryId: category._id,
        difficulty: "Beginner",
        price: 499,
        modules: [
          {
            order: 0,
            moduleTitle: { en: "Getting Started" },
            submodules: [
              {
                order: 0,
                submoduleTitle: { en: "Install Python" },
                contentBlocks: [
                  {
                    order: 0,
                    type: "TEXT",
                    title: { en: "Setup Notes" },
                    textContent: { en: "Install Python from python.org." },
                  },
                ],
              },
            ],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toMatchObject({
      en: "Python Basics",
      hi: "Python Basics_hi",
      mr: "Python Basics_mr",
    });
    expect(res.body.description.hi).toBe("Learn Python step by step._hi");
    expect(res.body.modules[0].moduleTitle.mr).toBe("Getting Started_mr");
    expect(res.body.modules[0].submodules[0].submoduleTitle.hi).toBe("Install Python_hi");
    expect(res.body.modules[0].submodules[0].contentBlocks[0].textContent.mr)
      .toBe("Install Python from python.org._mr");
    expect(res.body.price).toBe(499);

    const savedCourse = await Course.findById(res.body._id).lean();
    expect(savedCourse.title.hi).toBe("Python Basics_hi");
    expect(savedCourse.modules[0].contentBlocks).toBeUndefined();
    expect(savedCourse.modules[0].submodules[0].contentBlocks[0].title.hi).toBe("Setup Notes_hi");

    const savedCategory = await Category.findById(category._id).lean();
    expect(savedCategory.name).toMatchObject({
      en: "Programming",
      hi: "Programming_hi",
      mr: "Programming_mr",
    });
  });

  test("preserves manual translations on edit when source text is unchanged", async () => {
    const instructor = await createInstructor();
    const category = await Category.create({
      name: { en: "Data", hi: "Manual Category Hindi" },
      slug: "data",
    });
    const course = await Course.create({
      title: { en: "Data Course", hi: "Manual Hindi Title", mr: "Manual Marathi Title" },
      description: { en: "Data description", hi: "Manual Hindi Description" },
      instructorId: instructor.id,
      categoryId: category._id,
      difficulty: "Beginner",
      price: 0,
    });

    const res = await request(app)
      .put(`/api/courses/${course._id}`)
      .set("Authorization", `Bearer ${instructor.token}`)
      .send({
        title: { en: "Data Course" },
        description: { en: "Data description" },
        categoryId: category._id,
        difficulty: "Intermediate",
        price: 0,
      });

    expect(res.status).toBe(200);
    expect(res.body.title.hi).toBe("Manual Hindi Title");
    expect(res.body.title.mr).toBe("Manual Marathi Title");
    expect(res.body.description.hi).toBe("Manual Hindi Description");

    const savedCategory = await Category.findById(category._id).lean();
    expect(savedCategory.name.hi).toBe("Manual Category Hindi");
    expect(savedCategory.name.mr).toBe("Data_mr");
  });

  test("saves translated text, video URLs, quiz questions/options, and correctAnswerIndex through lesson edit", async () => {
    const instructor = await createInstructor();
    const category = await Category.create({ name: { en: "Quiz Cat" }, slug: "quiz-cat" });
    const moduleId = new mongoose.Types.ObjectId();
    const submoduleId = new mongoose.Types.ObjectId();
    const course = await Course.create({
      title: { en: "Quiz Course" },
      instructorId: instructor.id,
      categoryId: category._id,
      difficulty: "Beginner",
      modules: [
        {
          _id: moduleId,
          moduleId,
          order: 0,
          moduleTitle: { en: "Quiz Module" },
          submodules: [
            {
              _id: submoduleId,
              submoduleId,
              order: 0,
              submoduleTitle: { en: "Quiz Lesson" },
              contentBlocks: [],
            },
          ],
        },
      ],
    });

    const videoUrl = "https://cdn.example.com/video.mp4";
    const res = await request(app)
      .put(`/api/submodules/${submoduleId}/blocks`)
      .set("Authorization", `Bearer ${instructor.token}`)
      .send({
        blocks: [
          {
            order: 0,
            type: "TEXT",
            title: { en: "Lesson Text" },
            textContent: { en: "This is the saved lesson." },
          },
          {
            order: 1,
            type: "VIDEO",
            title: { en: "Video Lesson" },
            video: { type: "external", provider: "direct", url: videoUrl },
          },
          {
            order: 2,
            type: "QUIZ",
            title: { en: "Knowledge Check" },
            quizQuestions: [
              {
                question: { en: "Which option is correct?" },
                options: [
                  { en: "First" },
                  { en: "Second" },
                  { en: "Third" },
                ],
                correctAnswerIndex: 2,
              },
            ],
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.blocks[0].textContent.hi).toBe("This is the saved lesson._hi");
    expect(res.body.blocks[1].video.url).toBe(videoUrl);
    expect(res.body.blocks[1].video.url).not.toContain("_hi");

    const savedCourse = await Course.findById(course._id).lean();
    const savedBlocks = savedCourse.modules[0].submodules[0].contentBlocks;
    expect(savedBlocks[0].textContent.mr).toBe("This is the saved lesson._mr");
    expect(savedBlocks[1].video.url).toBe(videoUrl);

    const quiz = await Quiz.findById(savedBlocks[2].quizId).lean();
    expect(quiz.title.hi).toBe("Knowledge Check_hi");
    expect(quiz.questions[0].questionText.mr).toBe("Which option is correct?_mr");
    expect(quiz.questions[0].options[2].text.hi).toBe("Third_hi");
    expect(quiz.questions[0].correctAnswerIndex).toBe(2);
    expect(String(quiz.questions[0].correctOptionId)).toBe(String(quiz.questions[0].options[2].optionId));
  });
});
