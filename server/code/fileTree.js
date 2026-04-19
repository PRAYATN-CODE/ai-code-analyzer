/**
 * File Tree Builder
 * Converts a flat list of file paths into an indented ASCII tree string.
 * Used to feed the Planner Agent with architectural context.
 */

/**
 * Builds an indented ASCII file tree from an array of file paths.
 * @param {string[]} paths - Array of relative file paths
 * @returns {string} ASCII tree representation
 */
const buildFileTree = (paths) => {
  if (!paths || paths.length === 0) return "(empty)";

  const tree = {};

  paths.forEach((filePath) => {
    const parts = filePath.split("/").filter(Boolean);
    let node = tree;
    parts.forEach((part) => {
      if (!node[part]) node[part] = {};
      node = node[part];
    });
  });

  const render = (node, prefix = "", isLast = true) => {
    const entries = Object.keys(node).sort((a, b) => {
      // Directories (non-empty objects) come before files
      const aIsDir = Object.keys(node[a]).length > 0;
      const bIsDir = Object.keys(node[b]).length > 0;
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    let result = "";
    entries.forEach((key, idx) => {
      const isLastEntry = idx === entries.length - 1;
      const connector = isLastEntry ? "└── " : "├── ";
      const extension = isLastEntry ? "    " : "│   ";
      result += `${prefix}${connector}${key}\n`;

      const children = node[key];
      if (Object.keys(children).length > 0) {
        result += render(children, prefix + extension, isLastEntry);
      }
    });

    return result;
  };

  return render(tree);
};

/**
 * Summarizes file tree stats for context headers.
 * @param {string[]} paths
 */
const getFileTreeStats = (paths) => {
  const extensions = {};
  paths.forEach((p) => {
    const ext = p.split(".").pop().toLowerCase();
    extensions[ext] = (extensions[ext] || 0) + 1;
  });

  const topLanguages = Object.entries(extensions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ext, count]) => `${ext} (${count})`);

  return {
    totalFiles: paths.length,
    topLanguages,
  };
};

module.exports = { buildFileTree, getFileTreeStats };
