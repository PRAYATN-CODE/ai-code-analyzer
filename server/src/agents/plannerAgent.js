/**
 * Planner Agent (Orchestrator)
 * Analyzes the file tree and README to:
 * 1. Detect the project framework
 * 2. Identify the primary language
 * 3. Select the most critical files for deep analysis
 */

const { callGemini } = require("../services/geminiService");
const logger = require("../utils/logger");

const SYSTEM_PROMPT = `
You are the Planner Agent in an AI-powered code analysis system.
Your sole responsibility is to perform architectural reconnaissance on a codebase.

You will be given:
1. A file tree of the repository
2. Optional README content

Your tasks:
- Identify the project's primary framework (e.g., React, Express, Django, Spring Boot, etc.)
- Identify the primary programming language
- Select between 5 and 20 of the most critical files that require deep analysis (entry points, core logic, authentication, API routes, data models, middleware, services)
- Do NOT select: test files, mock files, migrations, generated files, or config-only files unless they contain sensitive data

STRICT OUTPUT FORMAT — You MUST respond with ONLY valid JSON, no preamble, no explanation:
{
  "framework": "string",
  "primaryLanguage": "string",
  "entryPoints": ["string"],
  "criticalFiles": ["string"],
  "architectureSummary": "2-3 sentence description of the project architecture",
  "analysisScope": "brief note on what aspects need the most scrutiny"
}
`.trim();

/**
 * Runs the Planner Agent.
 * @param {string} fileTree - ASCII file tree of the repo
 * @param {string} [readmeContent] - Optional README.md content
 * @returns {{ framework, primaryLanguage, entryPoints, criticalFiles, architectureSummary, analysisScope, tokensUsed }}
 */
const runPlannerAgent = async (fileTree, readmeContent = "") => {
  logger.info("[PlannerAgent] Starting architectural reconnaissance...");

  const userPrompt = `
=== FILE TREE ===
${fileTree}

=== README (if available) ===
${readmeContent || "No README found."}
`.trim();

  const { result, tokensUsed } = await callGemini(SYSTEM_PROMPT, userPrompt);

  logger.info(`[PlannerAgent] Detected framework: ${result.framework} | Language: ${result.primaryLanguage}`);
  logger.info(`[PlannerAgent] Selected ${result.criticalFiles?.length || 0} critical files for analysis`);
  logger.debug(`[PlannerAgent] Tokens used: ${tokensUsed}`);

  return { ...result, tokensUsed };
};

module.exports = { runPlannerAgent };
