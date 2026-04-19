/**
 * Google Gemini API Client Configuration
 * Exports the GoogleGenAI singleton and a helper for generation config.
 */

const { GoogleGenAI } = require("@google/genai");
const logger = require("../utils/logger");

if (!process.env.GEMINI_API_KEY) {
  logger.error("GEMINI_API_KEY is not defined in environment variables.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Safety settings — relaxed for code analysis use case.
 * New SDK uses string values directly instead of enum objects.
 */
const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_HATE_SPEECH",        threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT",  threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",  threshold: "BLOCK_ONLY_HIGH" },
];

/**
 * Default generation config for structured JSON output.
 */
const defaultGenerationConfig = {
  temperature: 0.1,
  topK: 32,
  topP: 0.95,
  maxOutputTokens: 8192,
};

module.exports = { ai, safetySettings, defaultGenerationConfig };