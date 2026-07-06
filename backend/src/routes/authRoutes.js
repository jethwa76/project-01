import express from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  forgotPasswordRules,
  loginRules,
  passwordResetRules,
  registerRules
} from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/forgot-password", forgotPasswordRules, validate, forgotPassword);
router.patch("/reset-password/:token", passwordResetRules, validate, resetPassword);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;
