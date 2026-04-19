/**
 * Auth Middleware
 * Verifies JWT token and attaches decoded user to req.user.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

/**
 * Protects routes — requires valid JWT.
 */
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn(`Auth token invalid: ${error.message}`);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Restricts access to specific roles.
 * @param {...string} roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this resource`,
      });
    }
    next();
  };
};