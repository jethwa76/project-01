import express from "express";
import { getExperiences, getAllExperiences, getExperience, createExperience, updateExperience, deleteExperience } from "../controllers/experienceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getExperiences);
router.get("/all", protect, authorize("admin", "editor"), getAllExperiences);
router.get("/:id", getExperience);
router.post("/", protect, authorize("admin", "editor"), createExperience);
router.patch("/:id", protect, authorize("admin", "editor"), updateExperience);
router.delete("/:id", protect, authorize("admin"), deleteExperience);

export default router;
