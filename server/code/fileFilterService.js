/**
 * File Filter Service
 * Applies heuristic rules to strip non-essential files from extracted repos.
 * Ensures only relevant source code reaches the Gemini API.
 */

// ─── Excluded Directories ─────────────────────────────────────────────────────
const EXCLUDED_DIRS = [
  /node_modules/,
  /\.git(\/|$)/,
  /\.next(\/|$)/,
  /dist(\/|$)/,
  /build(\/|$)/,
  /coverage(\/|$)/,
  /\.cache(\/|$)/,
  /vendor(\/|$)/,
  /__pycache__/,
  /\.venv/,
  /\.env\//,
  /\.idea(\/|$)/,
  /\.vscode(\/|$)/,
];

// ─── Excluded File Extensions ─────────────────────────────────────────────────
const EXCLUDED_EXTENSIONS = new Set([
  // Binary / media
  "png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "bmp", "tiff",
  "mp3", "mp4", "wav", "avi", "mov", "mkv",
  "woff", "woff2", "ttf", "eot", "otf",
  "zip", "tar", "gz", "rar", "7z",
  "exe", "dll", "so", "dylib",
  // Lock files / generated
  "lock",
  // Minified / bundled
  "min.js", "min.css", "bundle.js",
  // Binary data
  "pyc", "pyo", "class",
  "pdf", "doc", "docx", "xls", "xlsx",
]);

// ─── Excluded Exact Filenames ─────────────────────────────────────────────────
const EXCLUDED_FILENAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "composer.lock",
  "Gemfile.lock",
  ".DS_Store",
  "Thumbs.db",
  ".gitignore",
  ".gitattributes",
  ".npmignore",
  ".eslintignore",
  "LICENSE",
  "LICENSE.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
]);

// ─── Max file size (bytes) to prevent huge files from bloating context ─────────
const MAX_FILE_SIZE_BYTES = 150 * 1024; // 150 KB per file

/**
 * Determines whether a file path should be included in analysis.
 * @param {string} filePath - Relative file path
 * @param {number} [fileSize] - File size in bytes
 * @returns {boolean}
 */
const shouldIncludeFile = (filePath, fileSize = 0) => {
  // Check excluded directories
  for (const pattern of EXCLUDED_DIRS) {
    if (pattern.test(filePath)) return false;
  }

  const parts = filePath.split("/");
  const filename = parts[parts.length - 1];

  // Check exact filename exclusions
  if (EXCLUDED_FILENAMES.has(filename)) return false;

  // Check extension exclusions
  const ext = filename.split(".").slice(1).join(".").toLowerCase(); // handles .min.js
  if (EXCLUDED_EXTENSIONS.has(ext)) return false;
  const simpleExt = filename.split(".").pop().toLowerCase();
  if (EXCLUDED_EXTENSIONS.has(simpleExt)) return false;

  // Skip oversized files
  if (fileSize > MAX_FILE_SIZE_BYTES) return false;

  return true;
};

/**
 * Filters a list of file entries.
 * @param {Array<{ path: string, content: string, size?: number }>} files
 * @returns {Array<{ path: string, content: string }>}
 */
const filterFiles = (files) => {
  return files.filter((file) =>
    shouldIncludeFile(file.path, file.size || Buffer.byteLength(file.content || "", "utf8"))
  );
};

/**
 * Returns only priority files (entry points, configs, core logic).
 * Gives the Planner Agent the most important files first.
 * @param {string[]} paths
 * @returns {string[]} Sorted priority paths
 */
const getPriorityFiles = (paths) => {
  const HIGH_PRIORITY = [
    /README\.md$/i,
    /package\.json$/,
    /index\.(js|ts|jsx|tsx)$/,
    /app\.(js|ts|jsx|tsx)$/,
    /main\.(js|ts|jsx|tsx)$/,
    /server\.(js|ts)$/,
    /routes\//,
    /controllers\//,
    /models\//,
    /middleware\//,
    /auth/i,
    /config\//,
  ];

  const priority = [];
  const rest = [];

  paths.forEach((p) => {
    if (HIGH_PRIORITY.some((pattern) => pattern.test(p))) {
      priority.push(p);
    } else {
      rest.push(p);
    }
  });

  return [...priority, ...rest];
};

module.exports = { shouldIncludeFile, filterFiles, getPriorityFiles };
