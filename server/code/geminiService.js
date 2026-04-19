/**
 * Gemini Service
 * Centralized service for all Gemini API calls.
 * Implements retry logic, error normalization, and token tracking.
 */

const { getGeminiModel } = require("../config/gemini");
const { extractJSON } = require("../utils/jsonValidator");
const logger = require("../utils/logger");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Sleeps for a given duration.
 * @param {number} ms
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Calls the Gemini API with a structured prompt, enforcing JSON output.
 * Implements exponential backoff on transient errors.
 *
 * @param {string} systemPrompt - The agent's persona/instruction block
 * @param {string} userPrompt   - The actual code/data payload
 * @param {object} [modelOverrides] - Optional generation config overrides
 * @returns {{ result: object, tokensUsed: number }}
 */
const callGemini = async (systemPrompt, userPrompt, modelOverrides = {}) => {
  const model = getGeminiModel(modelOverrides);

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.debug(`Gemini API call — Attempt ${attempt}/${MAX_RETRIES}`);

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const rawText = response.text();

      // Track token usage from response metadata (if available)
      const tokensUsed =
        response.usageMetadata?.totalTokenCount ||
        Math.ceil(fullPrompt.length / 4) + Math.ceil(rawText.length / 4);

      const parsed = extractJSON(rawText);

      return { result: parsed, tokensUsed };
    } catch (error) {
      lastError = error;
      const isRetryable =
        error.message?.includes("503") ||
        error.message?.includes("429") ||
        error.message?.includes("overloaded") ||
        error.message?.includes("timeout");

      if (!isRetryable || attempt === MAX_RETRIES) break;

      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      logger.warn(`Gemini API error (attempt ${attempt}): ${error.message}. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  logger.error(`Gemini API failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
  throw new Error(`Gemini API call failed: ${lastError.message}`);
};

module.exports = { callGemini };
