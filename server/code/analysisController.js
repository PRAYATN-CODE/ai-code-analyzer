/**
 * Analysis Controller
 * Handles submission of analysis jobs and report retrieval.
 */

const { validationResult } = require("express-validator");
const { analyzeRepository, analyzeSnippet } = require("../services/analysisOrchestrator");
const AnalysisReport = require("../models/AnalysisReport");
const User = require("../models/User");
const logger = require("../utils/logger");

// ─── POST /api/v1/analysis/github ─────────────────────────────────────────────
exports.submitGithubAnalysis = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { githubUrl } = req.body;
  const userId = req.user.id;

  // Fire-and-forget — returns jobId immediately, processing happens async
  res.status(202).json({
    success: true,
    message: "Analysis job accepted. Poll /api/v1/analysis/status/:jobId for updates.",
    jobId: null, // will be filled in async — see below
  });

  // Actually run the pipeline after response sent
  // (In production, consider a job queue like BullMQ)
  try {
    const jobId = await analyzeRepository(githubUrl, userId);
    // Update user usage stats
    await User.findByIdAndUpdate(userId, {
      $inc: { "apiUsage.analysisCount": 1 },
      "apiUsage.lastActiveAt": new Date(),
    });
    logger.info(`[AnalysisController] GitHub job completed: ${jobId}`);
  } catch (error) {
    logger.error(`[AnalysisController] GitHub analysis failed: ${error.message}`);
  }
};

// ─── POST /api/v1/analysis/snippet ───────────────────────────────────────────
exports.submitSnippetAnalysis = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { code, language } = req.body;
  const userId = req.user.id;

  // For snippets — respond synchronously (faster, smaller context)
  const jobId = await analyzeSnippet(code, language || "javascript", userId);

  await User.findByIdAndUpdate(userId, {
    $inc: { "apiUsage.analysisCount": 1 },
    "apiUsage.lastActiveAt": new Date(),
  });

  const report = await AnalysisReport.findOne({ jobId });

  res.status(200).json({
    success: true,
    jobId,
    data: report,
  });
};

// ─── GET /api/v1/analysis/status/:jobId ──────────────────────────────────────
exports.getAnalysisStatus = async (req, res) => {
  const { jobId } = req.params;

  const report = await AnalysisReport.findOne({ jobId })
    .select("jobId status errorMessage createdAt agentMetadata")
    .lean();

  if (!report) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  // Verify ownership
  if (report.user?.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  res.status(200).json({ success: true, data: report });
};

// ─── GET /api/v1/analysis/report/:jobId ──────────────────────────────────────
exports.getAnalysisReport = async (req, res) => {
  const { jobId } = req.params;

  const report = await AnalysisReport.findOne({ jobId })
    .populate("repository", "name githubUrl branch detectedFramework")
    .lean();

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  if (report.user?.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  if (report.status !== "completed") {
    return res.status(202).json({
      success: false,
      message: `Report is not ready yet. Current status: ${report.status}`,
      status: report.status,
    });
  }

  res.status(200).json({ success: true, data: report });
};

// ─── GET /api/v1/analysis/history ────────────────────────────────────────────
exports.getAnalysisHistory = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    AnalysisReport.find({ user: req.user.id })
      .select("jobId status inputType createdAt summary architectureContext.framework")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AnalysisReport.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({
    success: true,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: reports,
  });
};

// ─── DELETE /api/v1/analysis/report/:jobId ───────────────────────────────────
exports.deleteReport = async (req, res) => {
  const report = await AnalysisReport.findOne({ jobId: req.params.jobId });

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  if (report.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  await report.deleteOne();
  res.status(200).json({ success: true, message: "Report deleted" });
};
