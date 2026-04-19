/**
 * AI Code Analyzer — Server Entry Point
 * Boots the Express app, connects to MongoDB, and starts listening.
 */

require("dotenv").config();
require("express-async-errors");

const app = require("./src/app");
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Graceful shutdown on SIGTERM
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Gracefully shutting down...");
      server.close(() => {
        logger.info("Server closed.");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
