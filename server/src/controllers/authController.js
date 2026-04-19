/**
 * Auth Controller
 * Handles registration, login, and token refresh.
 */

const { validationResult } = require("express-validator");
const User = require("../models/User");
const logger = require("../utils/logger");

/**
 * Sends a JWT token response.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ─── POST /api/v1/auth/register ───────────────────────────────────────────────
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({ name, email, password });
  logger.info(`New user registered: ${email}`);
  sendTokenResponse(user, 201, res);
};

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "Account deactivated" });
  }

  // Update last active timestamp
  user.apiUsage.lastActiveAt = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${email}`);
  sendTokenResponse(user, 200, res);
};

// ─── GET /api/v1/auth/me ──────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate("analyses", "jobId status createdAt summary");
  res.status(200).json({ success: true, data: user });
};

// ─── PUT /api/v1/auth/update-password ────────────────────────────────────────
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
};