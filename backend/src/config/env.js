import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/portfolio_showcase",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "development-only-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "development-only-refresh-secret-change-me",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  jwtRememberMeExpiresIn: process.env.JWT_REMEMBER_ME_EXPIRES_IN || "30d",
  jwtCookieExpiresDays: Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7),

  // OAuth — Google
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",

  // OAuth — GitHub
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback",

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },

  // Email
  resetPasswordUrl: process.env.RESET_PASSWORD_URL || "http://localhost:5173/reset-password",
  verifyEmailUrl: process.env.VERIFY_EMAIL_URL || "http://localhost:5173/verify-email",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",

  // Redis
  redisUrl: process.env.REDIS_URL || "",

  // OpenAI (Phase 6)
  openaiApiKey: process.env.OPENAI_API_KEY || "",

  // 2FA
  twoFactorIssuer: process.env.TWO_FACTOR_ISSUER || "ShowcasePro"
};
