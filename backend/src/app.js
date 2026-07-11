import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import { env } from "./config/env.js";
import { initializePassport } from "./config/passport.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import { uploadImage } from "./controllers/uploadController.js";
import { upload } from "./middleware/upload.js";
import { protect } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { apiLimiter, securityMiddleware } from "./middleware/security.js";

initializePassport();

const app = express();


app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // In development, allow any localhost port
      if (env.nodeEnv === "development" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // In production, allow only the configured frontend URL
      if (origin === env.frontendUrl) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(apiLimiter);

securityMiddleware(app);

if (env.nodeEnv === "development") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Portfolio Showcase API is healthy." });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/downloads", downloadRoutes);
app.post("/api/upload", protect, upload.single("image"), uploadImage);

app.use(notFound);
app.use(errorHandler);

export default app;
