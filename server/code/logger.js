/**
 * Winston Logger
 * Writes logs to console (dev) and rotating daily files (prod).
 */

const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ─── Console format (human-readable for dev) ──────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack }) =>
    stack ? `[${timestamp}] ${level}: ${message}\n${stack}` : `[${timestamp}] ${level}: ${message}`
  )
);

// ─── File format (JSON for prod / log aggregators) ────────────────────────────
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ─── Transports ───────────────────────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    format: devFormat,
    silent: process.env.NODE_ENV === "test",
  }),
];

if (process.env.NODE_ENV === "production") {
  transports.push(
    new DailyRotateFile({
      filename: path.join("logs", "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      format: fileFormat,
      maxFiles: "14d",
      zippedArchive: true,
    }),
    new DailyRotateFile({
      filename: path.join("logs", "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      format: fileFormat,
      maxFiles: "14d",
      zippedArchive: true,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transports,
  exitOnError: false,
});

module.exports = logger;
