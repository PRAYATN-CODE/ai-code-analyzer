/**
 * JSON Validator & Extractor
 * Safely extracts and validates JSON from potentially messy Gemini responses.
 * Handles markdown code fences and extra preamble text.
 */

const logger = require("./logger");

/**
 * Extracts JSON from an LLM response string.
 * Strips markdown fences, finds first/last brace pair.
 * @param {string} rawText - Raw text response from Gemini
 * @returns {object} Parsed JSON object
 * @throws {Error} If valid JSON cannot be extracted
 */
const extractJSON = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("extractJSON received empty or non-string input");
  }

  let text = rawText.trim();

  // Strip markdown code fences  (```json ... ``` or ``` ... ```)
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");

  // Find the outermost JSON object or array
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");

  let startIdx = -1;
  let endChar = "";

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endChar = "}";
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endChar = "]";
  }

  if (startIdx === -1) {
    throw new Error("No JSON object or array found in LLM response");
  }

  const lastIdx = text.lastIndexOf(endChar);
  if (lastIdx === -1 || lastIdx <= startIdx) {
    throw new Error("Malformed JSON: missing closing bracket/brace");
  }

  const jsonStr = text.slice(startIdx, lastIdx + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    logger.error(`JSON parse failed: ${err.message}`);
    logger.debug(`Attempted to parse: ${jsonStr.substring(0, 500)}...`);
    throw new Error(`JSON parse error: ${err.message}`);
  }
};

/**
 * Validates that a parsed JSON object matches a required shape.
 * @param {object} data
 * @param {string[]} requiredKeys
 * @returns {boolean}
 */
const validateShape = (data, requiredKeys = []) => {
  if (typeof data !== "object" || data === null) return false;
  return requiredKeys.every((key) => key in data);
};

module.exports = { extractJSON, validateShape };
