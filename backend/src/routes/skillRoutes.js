import express from "express";
import {
  createSkill,
  deleteSkill,
  getSkill,
  getSkills,
  updateSkill
} from "../controllers/skillController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { skillRules } from "../validators/resourceValidators.js";

const router = express.Router();

router.route("/").get(getSkills).post(protect, authorize("admin"), skillRules, validate, createSkill);
router
  .route("/:id")
  .get(getSkill)
  .put(protect, authorize("admin"), skillRules, validate, updateSkill)
  .patch(protect, authorize("admin"), updateSkill)
  .delete(protect, authorize("admin"), deleteSkill);

export default router;
