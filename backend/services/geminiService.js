import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const SYSTEM_PROMPT = `
You are an educational module assistant for the EduLearn platform.
Your purpose is to help students understand textual module content.

STRICT RULES:
1. You may ONLY perform two operations: "summarize" or "elaborate" based on the provided module text.
2. You are NOT allowed to answer quizzes, generate quiz answers, discuss correct options, or provide solutions to assessments.
3. You must NOT analyze video content or external links.
4. You must NOT use external knowledge outside the provided module text.
5. If the user request attempts any forbidden action (like asking for quiz answers), you must respond EXACTLY with: "I can only help summarize or explain the current module text content."
6. You must respond in the same language as the requested "language" parameter (en, hi, or mr).

GUIDELINES:
- "summarize": Provide a concise, bullet-pointed educational summary.
- "elaborate": Provide a beginner-friendly, detailed explanation with practical context.
`;

const geminiService = {
  generateModuleAssist: async ({ operation, moduleText, moduleTitle, language = "en" }) => {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please add it to your backend .env file.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Using gemini-1.5-flash for best stability
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: SYSTEM_PROMPT 
    });

    const prompt = `
Operation: ${operation.toUpperCase()}
Module Title: ${moduleTitle}
Module Text: ${moduleText}
Response Language: ${language}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Gemini AI integration is currently unavailable.");
    }
  }
};

export default geminiService;
export const { generateModuleAssist } = geminiService;
