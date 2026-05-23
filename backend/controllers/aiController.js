import { marked } from "marked";
import geminiService from "../services/geminiService.js";

const FORBIDDEN_KEYWORDS = [
  "quiz answers", "correct option", "solve this quiz", "tell me answers", 
  "ignore previous instructions", "act as unrestricted", "what is the answer"
];

export const assistModule = async (req, res) => {
  try {
    const { operation, moduleText, moduleTitle, language = "en" } = req.body;

    // 1. Validation
    if (!operation || !["summarize", "elaborate"].includes(operation)) {
      return res.status(400).json({ message: "Invalid or missing operation" });
    }

    // Strip HTML to check actual text length
    const plainText = (moduleText || "").replace(/<[^>]*>/g, "").trim();

    if (!plainText || plainText.length < 20) {
      return res.status(400).json({ 
        message: "The current module doesn't have enough text content for the AI to analyze." 
      });
    }

    if (moduleText.length > 10000) {
      return res.status(400).json({ message: "Module text exceeds safety limits" });
    }

    // 2. Sanitization Check (Simple Keyword Block)
    const normalizedText = moduleText.toLowerCase();
    const hasInjection = FORBIDDEN_KEYWORDS.some(keyword => normalizedText.includes(keyword));
    
    if (hasInjection) {
      return res.json({ 
        result: "I can only help summarize or explain the current module text content." 
      });
    }

    // 3. Call Service
    const rawResult = await geminiService.generateModuleAssist({
      operation,
      moduleText,
      moduleTitle: moduleTitle || "Module Content",
      language
    });

    // 4. Reliable HTML Formatting using 'marked'
    const result = await marked.parse(rawResult);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message || "AI Assistance failed" });
  }
};
