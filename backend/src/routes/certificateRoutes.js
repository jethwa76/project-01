import express from "express";
import {
  createCertificate,
  deleteCertificate,
  getCertificate,
  getCertificates,
  updateCertificate
} from "../controllers/certificateController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { certificateRules } from "../validators/resourceValidators.js";

const router = express.Router();

router
  .route("/")
  .get(getCertificates)
  .post(protect, authorize("admin"), certificateRules, validate, createCertificate);
router
  .route("/:id")
  .get(getCertificate)
  .put(protect, authorize("admin"), certificateRules, validate, updateCertificate)
  .patch(protect, authorize("admin"), updateCertificate)
  .delete(protect, authorize("admin"), deleteCertificate);

export default router;
