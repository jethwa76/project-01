import express from "express";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonial,
  getTestimonials,
  updateTestimonial
} from "../controllers/testimonialController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { testimonialRules } from "../validators/resourceValidators.js";

const router = express.Router();

router
  .route("/")
  .get(getTestimonials)
  .post(protect, authorize("admin"), testimonialRules, validate, createTestimonial);
router
  .route("/:id")
  .get(getTestimonial)
  .put(protect, authorize("admin"), testimonialRules, validate, updateTestimonial)
  .patch(protect, authorize("admin"), updateTestimonial)
  .delete(protect, authorize("admin"), deleteTestimonial);

export default router;
