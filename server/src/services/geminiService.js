/**
 * Gemini Service
 * Centralized service for all Gemini API calls.
 * Key fix: on short 429 retryDelays (≤60s), WAIT and retry same model.
 * On long retryDelays (daily limit hit), skip to next model.
 */

const { ai, safetySettings, defaultGenerationConfig } = require("../config/gemini");
const { extractJSON } = require("../utils/jsonValidator");
const logger = require("../utils/logger");

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 3000;

// Minimum gap between any two Gemini calls (prevents burst triggering RPM limit)
const MIN_CALL_GAP_MS = 4500;
let lastCallTimestamp = 0;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Enforces a minimum gap between consecutive Gemini API calls.
 * Prevents 3 parallel Promise.all() agents from all firing simultaneously.
 */
const throttleCall = async () => {
  const now = Date.now();
  const elapsed = now - lastCallTimestamp;
  if (elapsed < MIN_CALL_GAP_MS) {
    await sleep(MIN_CALL_GAP_MS - elapsed);
  }
  lastCallTimestamp = Date.now();
};

/**
 * Parses retryDelay from a 429 Gemini error response.
 * Returns { waitMs, isDailyLimit }
 * - isDailyLimit = true when wait > 60s (means daily RPD quota is exhausted)
 * - isDailyLimit = false when wait ≤ 60s (means per-minute RPM/TPM spike, safe to wait)
 */
const parseRetryInfo = (message) => {
  try {
    const parsed = typeof message === "string" ? JSON.parse(message) : message;

    // Check if this is a daily limit violation (limit: 0 on RPD metric)
    const violations = parsed?.error?.details?.find(
      (d) => d["@type"] === "type.googleapis.com/google.rpc.QuotaFailure"
    )?.violations || [];

    const isDailyLimit = violations.some(
      (v) => v.quotaId?.includes("PerDay") && v.quotaMetric?.includes("requests")
    );

    const retryDelay = parsed?.error?.details?.find(
      (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
    )?.retryDelay;

    let waitMs = 0;
    if (retryDelay) {
      const seconds = parseFloat(retryDelay.replace("s", ""));
      waitMs = Math.ceil(seconds) * 1000;
    }

    return { waitMs, isDailyLimit };
  } catch (_) {
    return { waitMs: 0, isDailyLimit: false };
  }
};

/**
 * Calls the Gemini API with structured prompt, enforcing JSON output.
 * - Throttles calls to avoid RPM bursting
 * - Waits on short 429s (per-minute limit), skips on long 429s (daily limit)
 * - Falls back through model chain on 503 overload
 */
const callGemini = async (systemPrompt, userPrompt, modelOverrides = {}) => {
  // Model chain: most capable first, fallback to lighter models
  const MODELS = [
    process.env.GEMINI_MODEL || "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
  ];

  const { maxOutputTokens, temperature, ...otherOverrides } = modelOverrides;
  const generationConfig = {
    ...defaultGenerationConfig,
    ...(maxOutputTokens && { maxOutputTokens }),
    ...(temperature !== undefined && { temperature }),
    ...otherOverrides,
  };

  const contents = [{ role: "user", parts: [{ text: userPrompt }] }];

  let lastError;

  for (const modelName of MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // ✅ Enforce minimum gap before every call
        await throttleCall();

        logger.debug(
          `[GeminiService] Model: ${modelName} — Attempt ${attempt}/${MAX_RETRIES}`
        );

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: systemPrompt,
            safetySettings,
            ...generationConfig,
          },
        });

        const rawText = response.text;
        const tokensUsed =
          response.usageMetadata?.totalTokenCount ||
          Math.ceil((systemPrompt.length + userPrompt.length) / 4) +
          Math.ceil((rawText?.length || 0) / 4);

        let parsed;

        try {
          parsed = extractJSON(rawText);
        } catch (err) {
          logger.warn("Invalid JSON, returning fallback");
          parsed = { raw: rawText }; // fallback
        }
        return { result: parsed, tokensUsed };

      } catch (error) {
        lastError = error;
        const message = error.message || "";

        const is503 = message.includes("503") || message.includes("overloaded") || message.includes("UNAVAILABLE");
        const is429 = message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota");
        const isModelError = message.includes("404") || message.includes("not found") || message.includes("not supported");

        // ❌ Model doesn't exist → try next model immediately
        if (isModelError) {
          logger.warn(`[GeminiService] Model "${modelName}" not found. Trying next...`);
          break;
        }

        // ⚡ 429 Rate limit — critical fix: check if it's per-minute or daily
        if (is429) {
          const { waitMs, isDailyLimit } = parseRetryInfo(message);

          if (isDailyLimit) {
            // Daily RPD quota exhausted — no point retrying this model today
            logger.warn(
              `[GeminiService] Model "${modelName}" daily quota (RPD) exhausted. Trying next model...`
            );
            break; // skip to next model``
          }

          if (waitMs > 0 && waitMs <= 65000 && attempt < MAX_RETRIES) {
            // Per-minute limit hit — wait what the API tells us, then retry SAME model
            logger.warn(
              `[GeminiService] Model "${modelName}" per-minute limit hit. Waiting ${waitMs / 1000}s as requested by API...`
            );
            await sleep(waitMs);
            continue; // retry same model after waiting
          }

          // Unknown or very long wait — try next model
          logger.warn(`[GeminiService] Model "${modelName}" quota issue, switching to next model...`);
          break;
        }

        // 🔄 503 Overloaded — retry with exponential backoff
        if (is503 && attempt < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          logger.warn(
            `[GeminiService] Model "${modelName}" overloaded (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`
          );
          await sleep(delay);
          continue;
        }

        // Any other error on final attempt — try next model
        logger.warn(`[GeminiService] Model "${modelName}" failed: ${message.substring(0, 100)}`);
        break;
      }
    }
  }

  logger.error(`[GeminiService] All models exhausted.`);
  throw new Error(`Gemini API call failed: ${lastError?.message}`);
};

module.exports = { callGemini };