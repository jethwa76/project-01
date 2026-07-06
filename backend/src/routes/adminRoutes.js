import express from "express";
import { dashboardOverview } from "../controllers/adminController.js";
import { uploadImage } from "../controllers/uploadController.js";
import { authorize, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/overview", dashboardOverview);
router.post("/upload", upload.single("image"), uploadImage);

export default router;
