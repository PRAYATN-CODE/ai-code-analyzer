const express = require("express");
const router = express.Router();

const {
  submitGithubAnalysis,
  submitSnippetAnalysis,
  getAnalysisStatus,
  getAnalysisReport,
  getAnalysisHistory,
  deleteReport,
} = require("../controllers/analysisController");

const { protect } = require("../middleware/auth");
const { analysisRateLimiter } = require("../middleware/rateLimiter");
const {
  githubAnalysisRules,
  snippetAnalysisRules,
  jobIdRules,
} = require("../middleware/validate");

// All analysis routes require authentication
router.use(protect);

router.post("/github", analysisRateLimiter, githubAnalysisRules, submitGithubAnalysis);
router.post("/snippet", analysisRateLimiter, snippetAnalysisRules, submitSnippetAnalysis);
router.get("/status/:jobId", jobIdRules, getAnalysisStatus);
router.get("/report/:jobId", jobIdRules, getAnalysisReport);
router.get("/history", getAnalysisHistory);
router.delete("/report/:jobId", jobIdRules, deleteReport);

module.exports = router;
