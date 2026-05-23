import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import dotenv from "dotenv";

dotenv.config();

const client = new TranslateClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Translates text using Amazon Translate
 * @param {string} text - The source text in English
 * @param {string} targetLanguage - The target language code (hi, mr)
 * @returns {Promise<string>} - The translated text
 */
export const translateText = async (text, targetLanguage) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    return "";
  }

  // Validate target language
  if (!["hi", "mr"].includes(targetLanguage)) {
    console.warn(`[TRANSLATE] Unsupported target language: ${targetLanguage}`);
    return text;
  }

  try {
    const command = new TranslateTextCommand({
      SourceLanguageCode: "en",
      TargetLanguageCode: targetLanguage,
      Text: text,
    });

    const response = await client.send(command);
    return response.TranslatedText;
  } catch (error) {
    console.error(`[TRANSLATE] Error translating to ${targetLanguage}:`, error.message);
    // Fallback to original text if translation fails
    return text;
  }
};
