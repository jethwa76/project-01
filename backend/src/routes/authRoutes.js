import express from "express";
import passport from "passport";
import {
  changePassword,
  disable2FA,
  enable2FA,
  forgotPassword,
  getSessions,
  login,
  logout,
  me,
  oauthSuccess,
  refreshToken,
  register,
  resendVerification,
  resetPassword,
  revokeAllSessions,
  revokeSession,
  verify2FA,
  verifyEmail
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  changePasswordRules,
  forgotPasswordRules,
  loginRules,
  passwordResetRules,
  registerRules,
  twoFactorRules
} from "../validators/authValidators.js";

const router = express.Router();

// ── Public auth routes ──
router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/forgot-password", forgotPasswordRules, validate, forgotPassword);
router.patch("/reset-password/:token", passwordResetRules, validate, resetPassword);
router.post("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/refresh-token", refreshToken);

// ── OAuth — Google ──
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  oauthSuccess
);

// ── OAuth — GitHub ──
router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get("/github/callback",
  passport.authenticate("github", { failureRedirect: "/login", session: false }),
  oauthSuccess
);

// ── Protected auth routes ──
router.get("/me", protect, me);
router.post("/resend-verification", protect, resendVerification);
router.patch("/change-password", protect, changePasswordRules, validate, changePassword);

// ── 2FA ──
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/verify", protect, twoFactorRules, validate, verify2FA);
router.post("/2fa/disable", protect, twoFactorRules, validate, disable2FA);

// ── Session management ──
router.get("/sessions", protect, getSessions);
router.delete("/sessions/revoke-all", protect, revokeAllSessions);
router.delete("/sessions/:id", protect, revokeSession);

export default router;
