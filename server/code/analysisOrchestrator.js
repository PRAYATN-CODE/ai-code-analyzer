/**
 * Analysis Orchestrator
 * The brain of the multi-agent pipeline.
 * Coordinates the sequential + parallel execution of all AI agents.
 *
 * Pipeline:
 * 1. Planner Agent (sequential — must complete first)
 * 2. Bug + Security + Performance Agents (parallel via Promise.all)
 * 3. Fix Suggestion Agent (sequential — needs all 3 outputs)
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

const CODE_CONTEXT_TOKEN_BUDGET = 200_000; // ~800KB of code per agent call

/**
 * Assembles a single code context string from a file content map.
 * Limits the total to CODE_CONTEXT_TOKEN_BUDGET tokens.
 * Priority files (from planner) are placed first.
 *
 * @param {object} fileContentMap - { "path": "content" }
 * @param {string[]} priorityFiles - Files the Planner flagged as critical
 * @returns {string}
 */
const assembleCodeContext = (fileContentMap, priorityFiles = []) => {
  const ordered = [
    ...priorityFiles.filter((f) => fileContentMap[f]),
    ...Object.keys(fileContentMap).filter((f) => !priorityFiles.includes(f)),
  ];

  let context = "";
  for (const filePath of ordered) {
    const content = fileContentMap[filePath] || "";
    const block = `\n${"=".repeat(80)}\n// FILE: ${filePath}\n${"=".repeat(80)}\n${content}\n`;
    context += block;
  }

  return truncateToTokenBudget(context, CODE_CONTEXT_TOKEN_BUDGET);
};

/**
 * Runs the full multi-agent analysis pipeline for a GitHub repository.
 *
 * @param {string} githubUrl
 * @param {string} userId
 * @returns {Promise<string>} jobId of the created AnalysisReport
 */
const analyzeRepository = async (githubUrl, userId) => {
  const jobId = uuidv4();
  const startTime = Date.now();
  let report;

  try {
    // ── Create report doc as "processing" ────────────────────────────────────
    report = await AnalysisReport.create({
      user: userId,
      jobId,
      status: "processing",
      inputType: "github",
    });

    // ── Step 1: Fetch & filter repo files ─────────────────────────────────────
    logger.info(`[Orchestrator] Job ${jobId}: Fetching repository...`);
    const {
      fileContentMap,
      fileTree,
      detectedLanguages,
      totalFiles,
      analyzedFiles,
      owner,
      repo,
      branch,
    } = await fetchRepository(githubUrl);

    // ── Step 2: Save Repository doc ───────────────────────────────────────────
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

    // ── Step 3: Planner Agent ─────────────────────────────────────────────────
    logger.info(`[Orchestrator] Job ${jobId}: Running Planner Agent...`);
    const readmeContent = fileContentMap["README.md"] || fileContentMap["readme.md"] || "";
    const plannerResult = await runPlannerAgent(fileTree, readmeContent);

    // Update report with architecture context
    await AnalysisReport.findByIdAndUpdate(report._id, {
      repository: repositoryDoc._id,
      architectureContext: {
        framework: plannerResult.framework,
        entryPoints: plannerResult.entryPoints || [],
        primaryLanguage: plannerResult.primaryLanguage,
        fileTree,
      },
    });

    // ── Step 4: Assemble code context for analysis agents ─────────────────────
    const codeContext = assembleCodeContext(fileContentMap, plannerResult.criticalFiles || []);
    const archSummary = plannerResult.architectureSummary || "";

    // ── Step 5: Run Bug, Security, Performance agents IN PARALLEL ─────────────
    logger.info(`[Orchestrator] Job ${jobId}: Running parallel analysis agents...`);
    const [bugResults, securityResults, perfResults] = await Promise.all([
      runBugDetectionAgent(codeContext, archSummary),
      runSecurityAgent(codeContext, archSummary),
      runPerformanceAgent(codeContext, archSummary),
    ]);

    // ── Step 6: Fix Suggestion Agent (Synthesizer) ────────────────────────────
    logger.info(`[Orchestrator] Job ${jobId}: Running Fix Suggestion Agent...`);
    const finalResult = await runFixSuggestionAgent(
      bugResults,
      securityResults,
      perfResults,
      archSummary
    );

    const processingTimeMs = Date.now() - startTime;
    const totalTokens =
      (plannerResult.tokensUsed || 0) +
      (bugResults.tokensUsed || 0) +
      (securityResults.tokensUsed || 0) +
      (perfResults.tokensUsed || 0) +
      (finalResult.tokensUsed || 0);

    // ── Step 7: Persist final report ─────────────────────────────────────────
    await AnalysisReport.findByIdAndUpdate(report._id, {
      status: "completed",
      issues: finalResult.issues || [],
      summary: finalResult.summary || {},
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

    logger.info(
      `[Orchestrator] Job ${jobId}: Completed in ${(processingTimeMs / 1000).toFixed(1)}s | ${totalTokens} tokens used`
    );

    return jobId;
  } catch (error) {
    logger.error(`[Orchestrator] Job ${jobId} FAILED: ${error.message}`);
    if (report) {
      await AnalysisReport.findByIdAndUpdate(report._id, {
        status: "failed",
        errorMessage: error.message,
      }).catch(() => {});
    }
    throw error;
  }
};

/**
 * Runs the full pipeline for a manual code snippet.
 *
 * @param {string} code - Raw code pasted by user
 * @param {string} language - Language hint (e.g., "javascript")
 * @param {string} userId
 * @returns {Promise<string>} jobId
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

    const fileContentMap = { [`snippet.${language}`]: code };
    const fileTree = `└── snippet.${language}`;
    const archSummary = `Single code snippet in ${language}. Analyze it holistically.`;

    logger.info(`[Orchestrator] Job ${jobId}: Analyzing snippet (${language})...`);

    const codeContext = `// FILE: snippet.${language}\n${truncateToTokenBudget(code, CODE_CONTEXT_TOKEN_BUDGET)}`;

    const [bugResults, securityResults, perfResults] = await Promise.all([
      runBugDetectionAgent(codeContext, archSummary),
      runSecurityAgent(codeContext, archSummary),
      runPerformanceAgent(codeContext, archSummary),
    ]);

    const finalResult = await runFixSuggestionAgent(
      bugResults,
      securityResults,
      perfResults,
      archSummary
    );

    const processingTimeMs = Date.now() - startTime;
    const totalTokens =
      (bugResults.tokensUsed || 0) +
      (securityResults.tokensUsed || 0) +
      (perfResults.tokensUsed || 0) +
      (finalResult.tokensUsed || 0);

    await AnalysisReport.findByIdAndUpdate(report._id, {
      status: "completed",
      architectureContext: { framework: language, primaryLanguage: language, fileTree },
      issues: finalResult.issues || [],
      summary: finalResult.summary || {},
      agentMetadata: {
        bugAgentTokens: bugResults.tokensUsed,
        securityAgentTokens: securityResults.tokensUsed,
        performanceAgentTokens: perfResults.tokensUsed,
        fixAgentTokens: finalResult.tokensUsed,
        totalTokensUsed: totalTokens,
        processingTimeMs,
      },
    });

    return jobId;
  } catch (error) {
    logger.error(`[Orchestrator] Snippet job ${jobId} FAILED: ${error.message}`);
    if (report) {
      await AnalysisReport.findByIdAndUpdate(report._id, {
        status: "failed",
        errorMessage: error.message,
      }).catch(() => {});
    }
    throw error;
  }
};

module.exports = { analyzeRepository, analyzeSnippet };
