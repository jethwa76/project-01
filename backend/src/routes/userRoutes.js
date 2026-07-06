import express from "express";
import {
  changePassword,
  deleteUser,
  getAdminProfile,
  getUser,
  getUsers,
  toggleProjectList,
  updateProfile,
  updateUser
} from "../controllers/userController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/admin-profile", getAdminProfile);

router.use(protect);
router.patch("/profile", updateProfile);
router.patch("/change-password", changePassword);
router.patch("/saved-projects/:projectId", toggleProjectList("savedProjects"));
router.patch("/favorite-projects/:projectId", toggleProjectList("favoriteProjects"));

router.use(authorize("admin"));
router.route("/").get(getUsers);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
