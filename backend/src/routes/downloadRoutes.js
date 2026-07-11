import express from "express";
import { getDownloads, trackDownload } from "../controllers/downloadController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getDownloads);
router.post("/track", trackDownload);

export default router;
