import express from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getProjectBySlug,
  getProjects,
  likeProject,
  updateProject
} from "../controllers/projectController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { projectRules } from "../validators/resourceValidators.js";

const router = express.Router();

router.route("/").get(getProjects).post(protect, authorize("admin"), projectRules, validate, createProject);
router.get("/slug/:slug", getProjectBySlug);
router.patch("/:id/like", protect, likeProject);
router
  .route("/:id")
  .get(getProject)
  .put(protect, authorize("admin"), projectRules, validate, updateProject)
  .patch(protect, authorize("admin"), updateProject)
  .delete(protect, authorize("admin"), deleteProject);

export default router;
