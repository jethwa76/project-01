import express from "express";
import { getTags, createTag, updateTag, deleteTag } from "../controllers/tagController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getTags);
router.post("/", protect, authorize("admin", "editor"), createTag);
router.patch("/:id", protect, authorize("admin", "editor"), updateTag);
router.delete("/:id", protect, authorize("admin"), deleteTag);

export default router;
