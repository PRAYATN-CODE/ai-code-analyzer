/**
 * Global Error Handler Middleware
 * Normalizes all errors into a consistent JSON response format.
 */

const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  logger.error(`${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (error.statusCode === 500) logger.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = `Resource not found with id: ${err.value}`;
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate value for field: ${field}`;
    error.statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error.message = Object.values(err.errors).map((e) => e.message).join(", ");
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.statusCode = 401;
  }
  if (err.name === "TokenExpiredError") {
    error.message = "Token expired";
    error.statusCode = 401;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
