const express = require("express");
const router = express.Router();

const { register, login, getMe, updatePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authRateLimiter } = require("../middleware/rateLimiter");
const { registerRules, loginRules } = require("../middleware/validate");

router.post("/register", authRateLimiter, registerRules, register);
router.post("/login", authRateLimiter, loginRules, login);
router.get("/me", protect, getMe);
router.put("/update-password", protect, updatePassword);

module.exports = router;