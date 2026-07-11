import express from "express";
import { getSettings, updateSettings, updateHero, updateSocial, updateContact, updateResume, updateSeo } from "../controllers/settingsController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSettings);
router.patch("/", protect, authorize("admin"), updateSettings);
router.patch("/hero", protect, authorize("admin"), updateHero);
router.patch("/social", protect, authorize("admin"), updateSocial);
router.patch("/contact", protect, authorize("admin"), updateContact);
router.patch("/resume", protect, authorize("admin"), updateResume);
router.patch("/seo", protect, authorize("admin"), updateSeo);

export default router;
