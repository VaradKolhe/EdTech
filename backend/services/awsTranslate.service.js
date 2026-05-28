import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "ap-south-1";
const hasStaticCredentials = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

const client = new TranslateClient({
  region,
  ...(hasStaticCredentials
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

export const getTranslateConfig = () => ({
  provider: "aws-translate",
  region,
  hasCredentials: hasStaticCredentials,
});

/**
 * Translates text using Amazon Translate
 * @param {string} text - The source text
 * @param {string} targetLanguage - The target language code (en, hi, mr)
 * @param {string} sourceLanguage - The source language code (en, hi, mr)
 * @returns {Promise<string>} - The translated text
 */
export const translateText = async (text, targetLanguage, sourceLanguage = "en") => {
  if (!text || typeof text !== "string" || !text.trim()) {
    return "";
  }

  if (targetLanguage === sourceLanguage) {
    return text;
  }

  // Validate languages
  const supported = ["en", "hi", "mr"];
  if (!supported.includes(targetLanguage) || !supported.includes(sourceLanguage)) {
    console.warn(`[TRANSLATE] Unsupported language pair: ${sourceLanguage} -> ${targetLanguage}`);
    return text;
  }

  try {
    const command = new TranslateTextCommand({
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguage,
      Text: text,
    });

    const response = await client.send(command);
    return response.TranslatedText;
  } catch (error) {
    console.error(`[TRANSLATE] Error translating ${sourceLanguage} to ${targetLanguage}:`, error.message);
    // Fallback to original text if translation fails
    return text;
  }
};

export const checkTranslateHealth = async () => {
  if (!hasStaticCredentials) {
    return {
      success: false,
      provider: "aws-translate",
      region,
      message: "AWS Translate credentials are not configured.",
    };
  }

  try {
    const [hiResponse, mrResponse] = await Promise.all([
      client.send(new TranslateTextCommand({
        SourceLanguageCode: "en",
        TargetLanguageCode: "hi",
        Text: "Hello",
      })),
      client.send(new TranslateTextCommand({
        SourceLanguageCode: "en",
        TargetLanguageCode: "mr",
        Text: "Hello",
      })),
    ]);

    return {
      success: true,
      provider: "aws-translate",
      region,
      sample: {
        source: "Hello",
        hi: hiResponse.TranslatedText,
        mr: mrResponse.TranslatedText,
      },
    };
  } catch (error) {
    return {
      success: false,
      provider: "aws-translate",
      region,
      message: error.message || "AWS Translate health check failed.",
    };
  }
};
