/**
 * Rate Limiter Middleware
 * Global and per-endpoint rate limits using express-rate-limit.
 */

const rateLimit = require("express-rate-limit");

const createLimiter = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    skip: (req) => process.env.NODE_ENV === "test",
  });

// Global: 300 requests per 15 min per IP
exports.globalRateLimiter = createLimiter(15, 300, "Too many requests. Please try again later.");

// Auth routes: 10 attempts per 15 min (brute-force protection)
exports.authRateLimiter = createLimiter(15, 10, "Too many auth attempts. Please wait 15 minutes.");

// Analysis routes: 20 analysis jobs per hour per IP
exports.analysisRateLimiter = createLimiter(60, 20, "Analysis rate limit exceeded. Max 20 analyses per hour.");
