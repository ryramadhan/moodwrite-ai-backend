const express = require("express");
const rateLimit = require("express-rate-limit");
const { asyncHandler } = require("../utils/asyncHandler");
const { authenticateToken } = require("../middleware/auth");
const {
  register,
  login,
  getMe,
  googleLogin,
  forgotPassword,
  resetPasswordHandler,
} = require("../controllers/authController");

const router = express.Router();

// Rate limit for auth endpoints
// DEV MODE: Higher limit (100 per 15 min) for easier testing
// PROD: Lower this to 10-20 for production security
const isDev = process.env.NODE_ENV !== "production";
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isDev ? 100 : 10, // 100 for dev, 10 for prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Too many attempts. Please try again later.",
    },
  },
  // Skip successful requests (don't count them toward limit)
  skipSuccessfulRequests: false, // Set true to not count successful logins
});

// Register
router.post("/register", authLimiter, asyncHandler(register));

// Login
router.post("/login", authLimiter, asyncHandler(login));

// Google Login (ID Token verification)
router.post("/google", authLimiter, asyncHandler(googleLogin));

// Get current user (protected)
router.get("/me", authenticateToken, asyncHandler(getMe));

// Forgot password
router.post("/forgot-password", authLimiter, asyncHandler(forgotPassword));

// Reset password
router.post("/reset-password", authLimiter, asyncHandler(resetPasswordHandler));

module.exports = router;
