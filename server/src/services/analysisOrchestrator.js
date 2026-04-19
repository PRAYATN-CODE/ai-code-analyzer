/**
 * Analysis Orchestrator
 * Coordinates sequential execution of all AI agents.
 *
 * Pipeline:
 * 1. Planner Agent        (sequential — must complete first)
 * 2. Bug Agent            (sequential — avoids RPM burst)
 * 3. Security Agent       (sequential — avoids RPM burst)
 * 4. Performance Agent    (sequential — avoids RPM burst)
 * 5. Fix Suggestion Agent (sequential — needs all 3 outputs)
 *
 * ⚠️ WHY NOT Promise.all?
 * Free-tier Gemini: 10-15 RPM, 250K TPM/min.
 * 3 large prompts simultaneously = ~39K tokens/sec → instant 429.
 * Sequential spreads calls ~4-5s apart, stays within limits.
 */

const { v4: uuidv4 } = require("uuid");
const { runPlannerAgent } = require("../agents/plannerAgent");
const { runBugDetectionAgent } = require("../agents/bugDetectionAgent");
const { runSecurityAgent } = require("../agents/securityAgent");
const { runPerformanceAgent } = require("../agents/performanceAgent");
const { runFixSuggestionAgent } = require("../agents/fixSuggestionAgent");
const { fetchRepository } = require("./githubService");
const { truncateToTokenBudget } = require("../utils/tokenCounter");
const AnalysisReport = require("../models/AnalysisReport");
const Repository = require("../models/Repository");
const logger = require("../utils/logger");

const CODE_CONTEXT_TOKEN_BUDGET = 200_000;

const assembleCodeContext = (fileContentMap, priorityFiles = []) => {
  const ordered = [
    ...priorityFiles.filter((f) => fileContentMap[f]),
    ...Object.keys(fileContentMap).filter((f) => !priorityFiles.includes(f)),
  ];
  let context = "";
  for (const filePath of ordered) {
    const content = fileContentMap[filePath] || "";
    context += `\n${"=".repeat(80)}\n// FILE: ${filePath}\n${"=".repeat(80)}\n${content}\n`;
  }
  return truncateToTokenBudget(context, CODE_CONTEXT_TOKEN_BUDGET);
};

/**
 * Runs the full pipeline for a GitHub repository.
 * @param {string} githubUrl
 * @param {string} userId
 * @param {string} [existingJobId] - Pre-created jobId from controller (so client can poll)
 * @returns {Promise<string>} jobId
 */
const analyzeRepository = async (githubUrl, userId, existingJobId) => {
  const jobId = existingJobId || uuidv4();
  const startTime = Date.now();
  let report;

  try {
    if (existingJobId) {
      // Flip pre-created doc to "processing"
      report = await AnalysisReport.findOneAndUpdate(
        { jobId },
        { status: "processing" },
        { new: true }
      );
    } else {
      report = await AnalysisReport.create({
        user: userId,
        jobId,
        status: "processing",
        inputType: "github",
      });
    }

    logger.info(`[Orchestrator] Job ${jobId}: Fetching repository...`);
    const {
      fileContentMap, fileTree, detectedLanguages,
      totalFiles, analyzedFiles, owner, repo, branch,
    } = await fetchRepository(githubUrl);

    const repositoryDoc = await Repository.create({
      user: userId,
      name: `${owner}/${repo}`,
      type: "github",
      githubUrl,
      branch,
      detectedLanguages,
      totalFiles,
      analyzedFiles,
      status: "processing",
    });

    logger.info(`[Orchestrator] Job ${jobId}: Running Planner Agent...`);
    const readmeContent = fileContentMap["README.md"] || fileContentMap["readme.md"] || "";
    const plannerResult = await runPlannerAgent(fileTree, readmeContent);

    await AnalysisReport.findByIdAndUpdate(report._id, {
      repository: repositoryDoc._id,
      architectureContext: {
        framework: plannerResult.framework,
        entryPoints: plannerResult.entryPoints || [],
        primaryLanguage: plannerResult.primaryLanguage,
        fileTree,
      },
    });

    const codeContext = assembleCodeContext(fileContentMap, plannerResult.criticalFiles || []);
    const archSummary = plannerResult.architectureSummary || "";

    logger.info(`[Orchestrator] Job ${jobId}: Bug Detection Agent (1/3)...`);
    const bugResults = await runBugDetectionAgent(codeContext, archSummary);

    logger.info(`[Orchestrator] Job ${jobId}: Security Agent (2/3)...`);
    const securityResults = await runSecurityAgent(codeContext, archSummary);

    logger.info(`[Orchestrator] Job ${jobId}: Performance Agent (3/3)...`);
    const perfResults = await runPerformanceAgent(codeContext, archSummary);

    logger.info(`[Orchestrator] Job ${jobId}: Fix Suggestion Agent...`);
    const finalResult = await runFixSuggestionAgent(bugResults, securityResults, perfResults, archSummary);

    const processingTimeMs = Date.now() - startTime;
    const totalTokens =
      (plannerResult.tokensUsed || 0) + (bugResults.tokensUsed || 0) +
      (securityResults.tokensUsed || 0) + (perfResults.tokensUsed || 0) +
      (finalResult.tokensUsed || 0);

    await AnalysisReport.findByIdAndUpdate(report._id, {
      status: "completed",
      issues: finalResult.issues || [],
      summary: finalResult.summary || {},
      keyRecommendations: finalResult.keyRecommendations || [],
      agentMetadata: {
        plannerTokens: plannerResult.tokensUsed,
        bugAgentTokens: bugResults.tokensUsed,
        securityAgentTokens: securityResults.tokensUsed,
        performanceAgentTokens: perfResults.tokensUsed,
        fixAgentTokens: finalResult.tokensUsed,
        totalTokensUsed: totalTokens,
        processingTimeMs,
      },
    });

    await Repository.findByIdAndUpdate(repositoryDoc._id, {
      status: "completed",
      detectedFramework: plannerResult.framework,
      analyzedFiles,
      lastAnalyzedAt: new Date(),
    });

    logger.info(`[Orchestrator] Job ${jobId}: Done in ${(processingTimeMs / 1000).toFixed(1)}s | ${totalTokens} tokens`);
    return jobId;
  } catch (error) {
    logger.error(`[Orchestrator] Job ${jobId} FAILED: ${error.message}`);
    if (report) {
      await AnalysisReport.findByIdAndUpdate(report._id, {
        status: "failed",
        errorMessage: error.message,
      }).catch(() => { });
    }
    throw error;
  }
};

/**
 * Runs the full pipeline for a manual code snippet.
 */
const analyzeSnippet = async (code, language = "unknown", userId) => {
  const jobId = uuidv4();
  const startTime = Date.now();
  let report;

  try {
    report = await AnalysisReport.create({
      user: userId,
      jobId,
      status: "processing",
      inputType: "snippet",
    });

    const archSummary = `Single code snippet in ${language}. Analyze it holistically.`;
    const fileTree = `└── snippet.${language}`;
    const codeContext = `// FILE: snippet.${language}\n${truncateToTokenBudget(code, CODE_CONTEXT_TOKEN_BUDGET)}`;

    logger.info(`[Orchestrator] Job ${jobId}: Analyzing snippet (${language})...`);

    const bugResults = await runBugDetectionAgent(codeContext, archSummary);
    const securityResults = await runSecurityAgent(codeContext, archSummary);
    const perfResults = await runPerformanceAgent(codeContext, archSummary);
    const finalResult = await runFixSuggestionAgent(bugResults, securityResults, perfResults, archSummary);

    const processingTimeMs = Date.now() - startTime;
    const totalTokens =
      (bugResults.tokensUsed || 0) + (securityResults.tokensUsed || 0) +
      (perfResults.tokensUsed || 0) + (finalResult.tokensUsed || 0);

    await AnalysisReport.findByIdAndUpdate(report._id, {
      status: "completed",
      architectureContext: { framework: language, primaryLanguage: language, fileTree },
      issues: finalResult.issues || [],
      summary: finalResult.summary || {},
      keyRecommendations: finalResult.keyRecommendations || [],
      agentMetadata: {
        bugAgentTokens: bugResults.tokensUsed,
        securityAgentTokens: securityResults.tokensUsed,
        performanceAgentTokens: perfResults.tokensUsed,
        fixAgentTokens: finalResult.tokensUsed,
        totalTokensUsed: totalTokens,
        processingTimeMs,
      },
    });

    logger.info(`[Orchestrator] Snippet ${jobId}: Done in ${(processingTimeMs / 1000).toFixed(1)}s`);
    return jobId;
  } catch (error) {
    logger.error(`[Orchestrator] Snippet ${jobId} FAILED: ${error.message}`);
    if (report) {
      await AnalysisReport.findByIdAndUpdate(report._id, {
        status: "failed",
        errorMessage: error.message,
      }).catch(() => { });
    }
    throw error;
  }
};

module.exports = { analyzeRepository, analyzeSnippet };