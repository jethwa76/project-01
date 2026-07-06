import express from "express";
import {
  createMessage,
  deleteMessage,
  getMessage,
  getMessages,
  updateMessage
} from "../controllers/messageController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { messageRules } from "../validators/resourceValidators.js";
import { contactLimiter } from "../middleware/security.js";

const router = express.Router();

router.route("/").post(contactLimiter, messageRules, validate, createMessage).get(protect, authorize("admin"), getMessages);
router
  .route("/:id")
  .get(protect, authorize("admin"), getMessage)
  .patch(protect, authorize("admin"), updateMessage)
  .delete(protect, authorize("admin"), deleteMessage);

export default router;
