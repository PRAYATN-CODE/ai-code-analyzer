/**
 * AnalysisReport Model
 * Persists the final synthesized JSON report produced by the multi-agent pipeline.
 */

const mongoose = require("mongoose");

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const issueSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      required: true,
    },
    category: {
      type: String,
      enum: ["bug", "security", "performance", "code-quality"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String },
    lineStart: { type: Number },
    lineEnd: { type: Number },
    codeSnippet: { type: String },
    suggestion: { type: String },
    fixedCode: { type: String },
    references: [{ type: String }],
    effort: {
      type: String,
      enum: ["trivial", "minor", "moderate", "major"],
      default: "minor",
    },
  },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    totalIssues: { type: Number, default: 0 },
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    info: { type: Number, default: 0 },
    bugCount: { type: Number, default: 0 },
    securityCount: { type: Number, default: 0 },
    performanceCount: { type: Number, default: 0 },
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "F"],
      default: "F",
    },
  },
  { _id: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const analysisReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
    },
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    errorMessage: { type: String },
    architectureContext: {
      framework: String,
      entryPoints: [String],
      primaryLanguage: String,
      fileTree: String,
    },
    issues: [issueSchema],
    summary: summarySchema,
    agentMetadata: {
      plannerTokens: Number,
      bugAgentTokens: Number,
      securityAgentTokens: Number,
      performanceAgentTokens: Number,
      fixAgentTokens: Number,
      totalTokensUsed: Number,
      processingTimeMs: Number,
    },
    inputType: {
      type: String,
      enum: ["github", "snippet"],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index for fast dashboard queries ────────────────────────────────────────
analysisReportSchema.index({ user: 1, createdAt: -1 });
analysisReportSchema.index({ status: 1 });

module.exports = mongoose.model("AnalysisReport", analysisReportSchema);
