/**
 * GitHub Service
 * Fetches a GitHub repository as a .zip archive into memory (Buffer),
 * extracts it with adm-zip, and returns filtered source files.
 * Bypasses GitHub API rate limits entirely.
 */

const axios = require("axios");
const AdmZip = require("adm-zip");
const { filterFiles, getPriorityFiles } = require("./fileFilterService");
const { buildFileTree, getFileTreeStats } = require("../utils/fileTree");
const { checkContextFit, truncateToTokenBudget } = require("../utils/tokenCounter");
const logger = require("../utils/logger");

const GITHUB_ZIP_TIMEOUT_MS = 30000; // 30s timeout for large repos

/**
 * Parses a GitHub URL and returns owner, repo, and branch.
 * @param {string} url
 * @returns {{ owner: string, repo: string, branch: string }}
 */
const parseGithubUrl = (url) => {
  const match = url.match(
    /^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?(?:tree\/([\w.-]+))?$/
  );
  if (!match) throw new Error("Invalid GitHub URL format");

  return {
    owner: match[1],
    repo: match[2],
    branch: match[3] || "main",
  };
};

/**
 * Downloads a GitHub repo as a zip into a Buffer.
 * @param {string} owner
 * @param {string} repo
 * @param {string} branch
 * @returns {Buffer}
 */
const downloadRepoZip = async (owner, repo, branch) => {
  const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;

  logger.info(`Downloading repo zip: ${zipUrl}`);

  try {
    const response = await axios.get(zipUrl, {
      responseType: "arraybuffer",
      timeout: GITHUB_ZIP_TIMEOUT_MS,
      headers: {
        "User-Agent": "AI-Code-Analyzer/1.0",
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        }),
      },
    });

    return Buffer.from(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      // Try 'master' as fallback branch
      if (branch === "main") {
        logger.warn(`Branch 'main' not found. Retrying with 'master'...`);
        return downloadRepoZip(owner, repo, "master");
      }
      throw new Error(`Repository not found or branch '${branch}' does not exist`);
    }
    throw new Error(`Failed to download repository: ${error.message}`);
  }
};

/**
 * Main entry: fetches a GitHub repo and returns structured file data.
 * @param {string} githubUrl
 * @returns {{ files: Array, fileTree: string, stats: object, detectedLanguages: string[] }}
 */
const fetchRepository = async (githubUrl) => {
  const { owner, repo, branch } = parseGithubUrl(githubUrl);

  const zipBuffer = await downloadRepoZip(owner, repo, branch);

  logger.info(`Extracting zip archive (${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB)...`);

  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  const rawFiles = [];

  entries.forEach((entry) => {
    if (entry.isDirectory) return;

    // Strip the root folder prefix (e.g., "repo-main/src/..." → "src/...")
    const fullPath = entry.entryName;
    const pathParts = fullPath.split("/");
    const relativePath = pathParts.slice(1).join("/");

    if (!relativePath) return;

    const size = entry.header.size;
    const content = entry.getData().toString("utf8");

    rawFiles.push({ path: relativePath, content, size });
  });

  logger.info(`Total entries after extraction: ${rawFiles.length}`);

  // Apply heuristic file filtering
  const filtered = filterFiles(rawFiles);
  logger.info(`Files after filtering: ${filtered.length}`);

  // Build file tree from filtered paths
  const allPaths = filtered.map((f) => f.path);
  const prioritizedPaths = getPriorityFiles(allPaths);
  const fileTree = buildFileTree(prioritizedPaths);
  const stats = getFileTreeStats(prioritizedPaths);

  // Detect languages from extensions
  const langExtMap = {
    js: "JavaScript", ts: "TypeScript", jsx: "JavaScript (React)",
    tsx: "TypeScript (React)", py: "Python", java: "Java",
    rb: "Ruby", go: "Go", rs: "Rust", php: "PHP",
    cs: "C#", cpp: "C++", c: "C", swift: "Swift",
  };

  const detectedLanguages = [
    ...new Set(
      allPaths
        .map((p) => langExtMap[p.split(".").pop()?.toLowerCase()])
        .filter(Boolean)
    ),
  ];

  // Assemble file content map for agents (path → content)
  const fileContentMap = {};
  filtered.forEach((f) => {
    // Truncate individual files if too large for safe inclusion
    fileContentMap[f.path] = truncateToTokenBudget(f.content, 20000);
  });

  // Check total context fit
  const combinedContent = Object.entries(fileContentMap)
    .map(([path, content]) => `// FILE: ${path}\n${content}`)
    .join("\n\n");

  const contextCheck = checkContextFit(combinedContent);
  if (!contextCheck.fits) {
    logger.warn(
      `Context window: ${contextCheck.percentUsed}% used (${contextCheck.estimated} tokens). Will truncate.`
    );
  }

  return {
    files: filtered,
    fileContentMap,
    fileTree,
    stats,
    detectedLanguages,
    owner,
    repo,
    branch,
    totalFiles: rawFiles.length,
    analyzedFiles: filtered.length,
  };
};

module.exports = { fetchRepository, parseGithubUrl };
