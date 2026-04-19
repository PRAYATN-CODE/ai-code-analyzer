/**
 * Request Validation Rules
 * Uses express-validator for all incoming request validation.
 */

const { body, param } = require("express-validator");

exports.registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and a number"),
];

exports.loginRules = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.githubAnalysisRules = [
  body("githubUrl")
    .trim()
    .notEmpty()
    .withMessage("GitHub URL is required")
    .matches(/^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?\/?$/)
    .withMessage("Invalid GitHub repository URL"),
];

exports.snippetAnalysisRules = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Code snippet is required")
    .isLength({ min: 10, max: 500000 })
    .withMessage("Code must be between 10 and 500,000 characters"),
  body("language")
    .optional()
    .trim()
    .isIn([
      "javascript", "typescript", "python", "java", "ruby",
      "go", "rust", "php", "csharp", "cpp", "c", "swift", "kotlin",
    ])
    .withMessage("Unsupported language"),
];

exports.jobIdRules = [
  param("jobId")
    .trim()
    .notEmpty()
    .isUUID()
    .withMessage("Invalid job ID format"),
];