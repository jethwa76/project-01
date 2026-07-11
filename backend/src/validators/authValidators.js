import { body } from "express-validator";

export const registerRules = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
];

export const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required.")
];

export const passwordResetRules = [
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
];

export const forgotPasswordRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required.")
];

export const changePasswordRules = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters.")
];

export const twoFactorRules = [
  body("code").isLength({ min: 6, max: 6 }).isNumeric().withMessage("Valid 6-digit 2FA code is required.")
];

