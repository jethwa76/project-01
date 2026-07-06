import express from "express";
import { me } from "../controllers/authController.js";
import {
  changePassword,
  toggleProjectList,
  updateProfile
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", me);
router.patch("/", updateProfile);
router.patch("/change-password", changePassword);
router.patch("/saved-projects/:projectId", toggleProjectList("savedProjects"));
router.patch("/favorite-projects/:projectId", toggleProjectList("favoriteProjects"));

export default router;
