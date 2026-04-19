/**
 * Token Counter Utility
 * Provides a rough token estimate (GPT/Gemini-compatible: ~4 chars = 1 token).
 * Used to warn before context-window overflow.
 */

const CHARS_PER_TOKEN = 4;
const GEMINI_1_5_PRO_CONTEXT_LIMIT = 1_000_000; // 1M tokens
const SAFE_LIMIT_RATIO = 0.85; // Use 85% of context window max

/**
 * Estimate token count from a string.
 * @param {string} text
 * @returns {number} Estimated token count
 */
const estimateTokens = (text) => {
  if (!text || typeof text !== "string") return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
};

/**
 * Check if a string fits within Gemini's safe context window.
 * @param {string} text
 * @returns {{ fits: boolean, estimated: number, limit: number }}
 */
const checkContextFit = (text) => {
  const estimated = estimateTokens(text);
  const limit = Math.floor(GEMINI_1_5_PRO_CONTEXT_LIMIT * SAFE_LIMIT_RATIO);
  return {
    fits: estimated <= limit,
    estimated,
    limit,
    percentUsed: ((estimated / limit) * 100).toFixed(1),
  };
};

/**
 * Truncates content to fit within a given token budget.
 * @param {string} text
 * @param {number} maxTokens
 * @returns {string}
 */
const truncateToTokenBudget = (text, maxTokens) => {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n[... content truncated to fit context window ...]";
};

module.exports = { estimateTokens, checkContextFit, truncateToTokenBudget };
