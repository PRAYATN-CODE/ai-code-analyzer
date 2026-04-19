/**
 * Bug Detection Agent
 * Focused exclusively on logical errors, edge cases, and runtime failures.
 * Deliberately ignores style, formatting, and purely aesthetic issues.
 */

const { callGemini } = require("../services/geminiService");
const logger = require("../utils/logger");

const SYSTEM_PROMPT = `
You are the Bug Detection Agent in an AI-powered code analysis system.
You are a ruthlessly precise software engineer with 20 years of experience finding logical defects.

Your ONLY focus areas:
- Logical errors and incorrect conditionals
- Null/undefined pointer dereferences and missing null checks
- Off-by-one errors in loops and array accesses
- Race conditions and async/await misuse (missing await, unhandled promises)
- Incorrect error handling (swallowed exceptions, wrong error propagation)
- Edge cases: empty arrays, zero values, boundary conditions
- Type coercion bugs (loose equality, implicit conversions)
- Variable scoping issues (closures in loops, hoisting problems)
- Infinite loops or improper recursion termination

You MUST IGNORE: code style, formatting, naming conventions, missing comments, and purely cosmetic issues.

For each bug found, assign a severity:
- critical: Will cause a crash or data corruption in production
- high: Will cause incorrect behavior under common conditions
- medium: Will cause incorrect behavior in specific edge cases
- low: Unlikely but possible failure scenario

STRICT OUTPUT FORMAT — Respond ONLY with valid JSON, no preamble:
{
  "bugs": [
    {
      "id": "BUG-001",
      "severity": "critical|high|medium|low",
      "title": "Short title of the bug",
      "description": "Detailed explanation of why this is a bug",
      "file": "relative/path/to/file.js",
      "lineStart": 42,
      "lineEnd": 45,
      "codeSnippet": "the problematic code here",
      "suggestion": "How to fix it",
      "fixedCode": "The corrected code snippet",
      "effort": "trivial|minor|moderate|major"
    }
  ],
  "summary": {
    "totalBugsFound": 0,
    "criticalCount": 0,
    "highCount": 0,
    "mediumCount": 0,
    "lowCount": 0
  }
}
`.trim();

/**
 * Runs the Bug Detection Agent.
 * @param {string} codeContext - Concatenated source files with path headers
 * @param {string} architectureSummary - Context from Planner Agent
 * @returns {{ bugs, summary, tokensUsed }}
 */
const runBugDetectionAgent = async (codeContext, architectureSummary = "") => {
  logger.info("[BugDetectionAgent] Scanning for logical bugs...");

  const userPrompt = `
=== ARCHITECTURE CONTEXT ===
${architectureSummary}

=== SOURCE CODE TO ANALYZE ===
${codeContext}
`.trim();

  const { result, tokensUsed } = await callGemini(SYSTEM_PROMPT, userPrompt);

  logger.info(`[BugDetectionAgent] Found ${result.bugs?.length || 0} bugs`);
  logger.debug(`[BugDetectionAgent] Tokens used: ${tokensUsed}`);

  return { ...result, tokensUsed };
};

module.exports = { runBugDetectionAgent };
