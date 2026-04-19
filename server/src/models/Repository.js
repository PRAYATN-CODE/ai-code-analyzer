/**
 * Repository Model
 * Tracks ingested GitHub repos and manual code snippets per user.
 */

const mongoose = require("mongoose");

const repositorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Repository name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["github", "snippet"],
      required: true,
    },
    githubUrl: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/,
        "Invalid GitHub URL format",
      ],
    },
    branch: {
      type: String,
      default: "main",
    },
    detectedFramework: {
      type: String,
      default: "Unknown",
    },
    detectedLanguages: {
      type: [String],
      default: [],
    },
    totalFiles: {
      type: Number,
      default: 0,
    },
    analyzedFiles: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    lastAnalyzedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: reports ─────────────────────────────────────────────────────────
repositorySchema.virtual("reports", {
  ref: "AnalysisReport",
  localField: "_id",
  foreignField: "repository",
});

module.exports = mongoose.model("Repository", repositorySchema);
