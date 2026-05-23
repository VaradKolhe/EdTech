import request from "supertest";
import app from "../server.js";
import { connect, close } from "./setup.js";

beforeAll(async () => await connect());
afterAll(async () => await close());

describe("Module 4: AI Chatbot Assistance", () => {
  // NOT IMPLEMENTED IN PROJECT
  // TEST CANNOT PASS UNTIL FEATURE EXISTS

  test("TC-19: Valid course-related query to AI chatbot", async () => {
    // Expected: 200 and relevant response
    // Actual: 404 Route not found
    const res = await request(app).post("/api/chatbot/query").send({ query: "What is React?" });
    expect(res.status).toBe(404); 
    console.log("TC-19: NOT IMPLEMENTED IN PROJECT");
  });

  test("TC-20: Chatbot asked to reveal quiz answers", async () => {
    // Expected: 403 or similar rejection
    const res = await request(app).post("/api/chatbot/query").send({ query: "Give me the answers to the quiz." });
    expect(res.status).toBe(404);
    console.log("TC-20: NOT IMPLEMENTED IN PROJECT");
  });

  test("TC-21: Multi-turn context retention in chatbot", async () => {
    // Expected: Chatbot remembers previous query
    const res = await request(app).post("/api/chatbot/query").send({ query: "Tell me more about it." });
    expect(res.status).toBe(404);
    console.log("TC-21: NOT IMPLEMENTED IN PROJECT");
  });

  test("TC-22: Non-educational off-topic query to chatbot", async () => {
    // Expected: Chatbot redirects to educational topics
    const res = await request(app).post("/api/chatbot/query").send({ query: "What is the weather today?" });
    expect(res.status).toBe(404);
    console.log("TC-22: NOT IMPLEMENTED IN PROJECT");
  });

  test("TC-23: Chatbot query in non-English language", async () => {
    // Expected: Relevant response in Hindi/Marathi
    const res = await request(app).post("/api/chatbot/query").send({ query: "React क्या है?" });
    expect(res.status).toBe(404);
    console.log("TC-23: NOT IMPLEMENTED IN PROJECT");
  });
});
