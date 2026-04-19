/**
 * Google Gemini API Client Configuration
 * Exports a singleton generative model instance.
 */

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const logger = require("../utils/logger");

if (!process.env.GEMINI_API_KEY) {
  logger.error("GEMINI_API_KEY is not defined in environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Safety settings — relaxed for code analysis use case
 * (code can contain examples of vulnerabilities that need scanning)
 */
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

/**
 * Default generation config for structured JSON output
 */
const defaultGenerationConfig = {
  temperature: 0.1,       // Low temp for deterministic, analytical output
  topK: 32,
  topP: 0.95,
  maxOutputTokens: 8192,
};

/**
 * Returns a configured Gemini model instance.
 * @param {object} [overrides] - Optional config overrides
 */
const getGeminiModel = (overrides = {}) => {
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-pro-latest",
    safetySettings,
    generationConfig: { ...defaultGenerationConfig, ...overrides },
  });
};

module.exports = { getGeminiModel };
