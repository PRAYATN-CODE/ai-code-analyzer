/**
 * Repository Controller
 * CRUD for saved repository records.
 */

const Repository = require("../models/Repository");

// ─── GET /api/v1/repositories ────────────────────────────────────────────────
exports.getUserRepositories = async (req, res) => {
  const repos = await Repository.find({ user: req.user.id })
    .sort({ updatedAt: -1 })
    .lean();

  res.status(200).json({ success: true, count: repos.length, data: repos });
};

// ─── GET /api/v1/repositories/:id ────────────────────────────────────────────
exports.getRepository = async (req, res) => {
  const repo = await Repository.findById(req.params.id)
    .populate("reports", "jobId status summary createdAt")
    .lean();

  if (!repo) {
    return res.status(404).json({ success: false, message: "Repository not found" });
  }

  if (repo.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  res.status(200).json({ success: true, data: repo });
};

// ─── DELETE /api/v1/repositories/:id ─────────────────────────────────────────
exports.deleteRepository = async (req, res) => {
  const repo = await Repository.findById(req.params.id);

  if (!repo) {
    return res.status(404).json({ success: false, message: "Repository not found" });
  }

  if (repo.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  await repo.deleteOne();
  res.status(200).json({ success: true, message: "Repository deleted" });
};