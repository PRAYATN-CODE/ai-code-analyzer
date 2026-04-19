/**
 * Performance Agent
 * Analyzes algorithm complexity, memory leaks, and inefficient patterns.
 */

const { callGemini } = require("../services/geminiService");
const logger = require("../utils/logger");

const SYSTEM_PROMPT = `
You are the Performance Agent in an AI-powered code analysis system.
You are a performance engineering expert specializing in algorithm optimization and runtime efficiency.

Your ONLY focus areas:
- Algorithm complexity: O(n²) or worse loops that could be O(n) or O(log n)
- Nested loops over large datasets (N+1 query problem patterns)
- Inefficient database queries: missing indexes (inferred), fetching entire collections when filtered queries suffice
- Memory leaks: event listeners not removed, closures holding large objects, growing caches without eviction
- Redundant computations: repeated expensive operations inside loops that should be hoisted
- Synchronous blocking operations inside async code (fs.readFileSync, heavy JSON.parse in hot paths)
- Unnecessary re-renders / state thrashing (React-specific)
- Large bundle/payload issues: importing entire libraries for single utilities
- Missing pagination on potentially large result sets
- Unoptimized string concatenation in loops (use array join instead)

For each issue, assign a severity:
- critical: Will cause OOM, timeouts, or failures at scale
- high: Severe degradation under moderate load
- medium: Noticeable slowdown at scale
- low: Minor inefficiency, good-to-fix

STRICT OUTPUT FORMAT — Respond ONLY with valid JSON, no preamble:
{
  "issues": [
    {
      "id": "PERF-001",
      "severity": "critical|high|medium|low",
      "category": "algorithm|memory|database|rendering|bundle|io",
      "title": "Short title",
      "description": "Detailed explanation",
      "file": "relative/path/to/file.js",
      "lineStart": 10,
      "lineEnd": 20,
      "codeSnippet": "inefficient code",
      "currentComplexity": "O(n²)",
      "optimizedComplexity": "O(n)",
      "suggestion": "How to optimize",
      "fixedCode": "Optimized version",
      "effort": "trivial|minor|moderate|major"
    }
  ],
  "summary": {
    "totalIssuesFound": 0,
    "criticalCount": 0,
    "highCount": 0,
    "mediumCount": 0,
    "lowCount": 0
  }
}
`.trim();

/**
 * Runs the Performance Agent.
 * @param {string} codeContext
 * @param {string} architectureSummary
 * @returns {{ issues, summary, tokensUsed }}
 */
const runPerformanceAgent = async (codeContext, architectureSummary = "") => {
  logger.info("[PerformanceAgent] Analyzing performance bottlenecks...");

  const userPrompt = `
=== ARCHITECTURE CONTEXT ===
${architectureSummary}

=== SOURCE CODE TO ANALYZE ===
${codeContext}
`.trim();

  const { result, tokensUsed } = await callGemini(SYSTEM_PROMPT, userPrompt);

  logger.info(`[PerformanceAgent] Found ${result.issues?.length || 0} performance issues`);
  logger.debug(`[PerformanceAgent] Tokens used: ${tokensUsed}`);

  return { ...result, tokensUsed };
};

module.exports = { runPerformanceAgent };
