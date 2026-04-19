/**
 * Fix Suggestion Agent (The Synthesizer)
 * Receives raw outputs from Bug, Security, and Performance agents.
 * De-duplicates findings, ranks by impact, and generates the final report.
 */

const { callGemini } = require("../services/geminiService");
const logger = require("../utils/logger");

const SYSTEM_PROMPT = `
You are the Fix Suggestion Agent (Synthesizer) in an AI-powered code analysis system.
You receive the raw findings from three specialized agents (Bug, Security, Performance)
and your job is to produce a clean, consolidated, actionable final report.

Your tasks:
1. De-duplicate overlapping findings (if Bug and Security agents flagged the same issue, merge them)
2. Re-rank all findings by overall impact and fix priority
3. Ensure every issue has a clear, human-readable fix suggestion and corrected code snippet
4. Generate an overall code quality score from 0-100 based on severity distribution
5. Assign a letter grade: A (90-100), B (75-89), C (55-74), D (35-54), F (0-34)

Scoring rules:
- Start at 100
- Subtract: critical×20, high×10, medium×5, low×1
- Minimum score: 0

STRICT OUTPUT FORMAT — Respond ONLY with valid JSON, no preamble:
{
  "issues": [
    {
      "id": "ISSUE-001",
      "severity": "critical|high|medium|low|info",
      "category": "bug|security|performance|code-quality",
      "title": "string",
      "description": "string",
      "file": "string or null",
      "lineStart": null,
      "lineEnd": null,
      "codeSnippet": "string or null",
      "suggestion": "string",
      "fixedCode": "string or null",
      "references": [],
      "effort": "trivial|minor|moderate|major"
    }
  ],
  "summary": {
    "totalIssues": 0,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "info": 0,
    "bugCount": 0,
    "securityCount": 0,
    "performanceCount": 0,
    "overallScore": 85,
    "grade": "B"
  },
  "keyRecommendations": [
    "Top 3-5 most impactful actions the developer should take immediately"
  ]
}
`.trim();

/**
 * Runs the Fix Suggestion Agent.
 * @param {object} bugResults - Output from BugDetectionAgent
 * @param {object} securityResults - Output from SecurityAgent
 * @param {object} perfResults - Output from PerformanceAgent
 * @param {string} architectureSummary - Context from PlannerAgent
 * @returns {{ issues, summary, keyRecommendations, tokensUsed }}
 */
const runFixSuggestionAgent = async (
  bugResults,
  securityResults,
  perfResults,
  architectureSummary = ""
) => {
  logger.info("[FixSuggestionAgent] Synthesizing findings from all agents...");

  const userPrompt = `
=== ARCHITECTURE CONTEXT ===
${architectureSummary}

=== BUG DETECTION AGENT RESULTS ===
${JSON.stringify(bugResults, null, 2)}

=== SECURITY AGENT RESULTS ===
${JSON.stringify(securityResults, null, 2)}

=== PERFORMANCE AGENT RESULTS ===
${JSON.stringify(perfResults, null, 2)}
`.trim();

  const { result, tokensUsed } = await callGemini(SYSTEM_PROMPT, userPrompt, {
    maxOutputTokens: 8192,
    temperature: 0.05,
  });

  logger.info(
    `[FixSuggestionAgent] Final report: ${result.issues?.length || 0} issues | Score: ${result.summary?.overallScore} | Grade: ${result.summary?.grade}`
  );
  logger.debug(`[FixSuggestionAgent] Tokens used: ${tokensUsed}`);

  return { ...result, tokensUsed };
};

module.exports = { runFixSuggestionAgent };
