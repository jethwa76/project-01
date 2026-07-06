import express from "express";
import {
  createNotification,
  deleteNotification,
  getNotification,
  getNotifications,
  markNotificationRead,
  myNotifications,
  updateNotification
} from "../controllers/notificationController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { notificationRules } from "../validators/resourceValidators.js";

const router = express.Router();

router.use(protect);
router.get("/me", myNotifications);
router.patch("/:id/read", markNotificationRead);

router.use(authorize("admin"));
router.route("/").get(getNotifications).post(notificationRules, validate, createNotification);
router.route("/:id").get(getNotification).patch(updateNotification).delete(deleteNotification);

export default router;
