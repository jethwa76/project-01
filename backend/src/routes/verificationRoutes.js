import express from "express";
import multer from "multer";
import { protect, authorize } from "../middleware/auth.js";
import { ApiError } from "../utils/ApiError.js";
import {
  submitVerification,
  getMyVerifications,
  adminGetVerifications,
  adminReviewVerification
} from "../controllers/verificationController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, "Only images, PDFs, and Word documents are supported."));
    }
    cb(null, true);
  }
});

router.post("/", protect, upload.single("file"), submitVerification);
router.get("/my", protect, getMyVerifications);
router.get("/", protect, authorize("admin"), adminGetVerifications);
router.patch("/:id/status", protect, authorize("admin"), adminReviewVerification);

export default router;
