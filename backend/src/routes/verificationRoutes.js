import express from "express";
import {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  adminGetAllDocuments,
  adminReviewDocument
} from "../controllers/verificationController.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadDoc } from "../middleware/upload.js";

const router = express.Router();

// User routes
router.post("/upload", protect, uploadDoc.single("document"), uploadDocument);
router.get("/my-docs", protect, getMyDocuments);
router.delete("/:id", protect, deleteDocument);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), adminGetAllDocuments);
router.patch("/admin/review/:id", protect, authorize("admin"), adminReviewDocument);

export default router;
