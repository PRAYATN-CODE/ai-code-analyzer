/**
 * MongoDB Connection via Mongoose
 * Implements retry logic and connection event logging.
 */

const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    logger.error("MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 20,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
  };

  let retries = 5;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(MONGO_URI, options);
      logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
      break;
    } catch (error) {
      retries -= 1;
      logger.error(`MongoDB connection failed. Retries left: ${retries}. Error: ${error.message}`);
      if (retries === 0) {
        logger.error("All MongoDB connection retries exhausted. Exiting.");
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 5000)); // Wait 5s before retry
    }
  }

  mongoose.connection.on("disconnected", () =>
    logger.warn("MongoDB disconnected.")
  );

  mongoose.connection.on("error", (err) =>
    logger.error(`MongoDB error: ${err.message}`)
  );
};

module.exports = connectDB;
