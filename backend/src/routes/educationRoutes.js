import express from "express";
import { getEducation, getAllEducation, getEducationById, createEducation, updateEducation, deleteEducation } from "../controllers/educationController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getEducation);
router.get("/all", protect, authorize("admin", "editor"), getAllEducation);
router.get("/:id", getEducationById);
router.post("/", protect, authorize("admin", "editor"), createEducation);
router.patch("/:id", protect, authorize("admin", "editor"), updateEducation);
router.delete("/:id", protect, authorize("admin"), deleteEducation);

export default router;
