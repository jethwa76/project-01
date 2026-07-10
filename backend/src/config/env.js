import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/portfolio_showcase",
  jwtSecret: process.env.JWT_SECRET || "development-only-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtCookieExpiresDays: Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  resetPasswordUrl: process.env.RESET_PASSWORD_URL || "http://localhost:5173/reset-password",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || ""
};
