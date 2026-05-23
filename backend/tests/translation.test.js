import { translateCourseContent } from "../services/courseTranslation.service.js";
import { connect, close, clear } from "./setup.js";
import mongoose from "mongoose";

// Mocking AWS Translate to avoid real API calls/costs during testing
import * as awsService from "../services/awsTranslate.service.js";
jest.mock("../services/awsTranslate.service.js");

beforeAll(async () => await connect());
afterEach(async () => await clear());
afterAll(async () => await close());

describe("Course Translation Logic", () => {
  const mockCourseData = {
    title: { en: "Learn Python" },
    description: { en: "A complete guide to Python." },
    tags: { en: ["programming", "data"] },
    modules: [{
      moduleId: new mongoose.Types.ObjectId(),
      moduleTitle: { en: "Introduction" },
      submodules: []
    }]
  };

  test("Should generate hi and mr translations for a new course", async () => {
    // Setup Mock
    awsService.translateText.mockImplementation(async (text, lang) => {
      return `${text}_${lang}`; // Fake translation format
    });

    const result = await translateCourseContent(mockCourseData);

    expect(result.title.hi).toBe("Learn Python_hi");
    expect(result.title.mr).toBe("Learn Python_mr");
    expect(result.description.hi).toBe("A complete guide to Python._hi");
    expect(result.translationStatus.hi).toBe("COMPLETED");
  });

  test("Should preserve manual edits if English hasn't changed", async () => {
    const oldData = {
      title: { en: "Learn Python", hi: "Manual Hindi Title" },
    };
    
    const newData = {
      title: { en: "Learn Python" }, // English is the same
    };

    const result = await translateCourseContent(newData, oldData);

    // Should NOT call AWS Translate, should keep the manual edit
    expect(result.title.hi).toBe("Manual Hindi Title");
  });

  test("Should re-translate if English content changes", async () => {
    const oldData = {
      title: { en: "Old Title", hi: "Old Hindi" },
    };
    
    const newData = {
      title: { en: "New Title" }, // English changed!
    };

    awsService.translateText.mockResolvedValue("New Hindi Translated");

    const result = await translateCourseContent(newData, oldData);

    expect(result.title.hi).toBe("New Hindi Translated");
  });
});
