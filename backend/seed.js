const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Course = require("./models/Course");
const Module = require("./models/Module");
const Submodule = require("./models/Submodule");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Course.deleteMany(); await Module.deleteMany(); await Submodule.deleteMany();

  const course = await Course.create({
    title: "Introduction to Web Development",
    description: "Learn HTML, CSS, JavaScript and React from scratch.",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    teacherId: "teacher_001",
  });

  const mod1 = await Module.create({ moduleNumber: 1, title: "HTML Fundamentals", courseId: course._id });
  const mod2 = await Module.create({ moduleNumber: 2, title: "CSS Styling", courseId: course._id });

  const sm1 = await Submodule.create({
    title: "Introduction to HTML",
    moduleId: mod1._id,
    contents: [
      { type: "text", value: "<h2>What is HTML?</h2><p>HTML stands for HyperText Markup Language. It is the standard language for creating web pages.</p>" },
      { type: "video", value: "https://www.youtube.com/watch?v=qz0aGYrrlhU" },
    ],
    quizzes: [{ question: "What does HTML stand for?", options: ["HyperText Markup Language", "High Tech Modern Language", "HyperText Modern Links", "None"], correctAnswer: "HyperText Markup Language" }],
  });

  const sm2 = await Submodule.create({ title: "HTML Tags & Elements", moduleId: mod1._id, contents: [], quizzes: [] });
  const sm3 = await Submodule.create({ title: "CSS Selectors", moduleId: mod2._id, contents: [], quizzes: [] });

  await Module.findByIdAndUpdate(mod1._id, { submodules: [sm1._id, sm2._id] });
  await Module.findByIdAndUpdate(mod2._id, { submodules: [sm3._id] });
  await Course.findByIdAndUpdate(course._id, { modules: [mod1._id, mod2._id] });

  console.log("✅ Seed complete! Course ID:", course._id.toString());
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
