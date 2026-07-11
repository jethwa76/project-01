import express from "express";
import { dashboardOverview, getSystemLogs, getRecentActivity } from "../controllers/adminController.js";
import { getUsers, createUser, getUserDetails, updateUserRole, deleteUser } from "../controllers/adminUserController.js";
import { uploadImage } from "../controllers/uploadController.js";
import { authorize, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/overview",  dashboardOverview);
router.get("/logs",      getSystemLogs);
router.get("/activity",  getRecentActivity);
router.post("/upload",   upload.single("image"), uploadImage);

// ── User monitoring ──
router.get("/users",          getUsers);
router.post("/users",         createUser);
router.get("/users/:id",      getUserDetails);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id",   deleteUser);

export default router;

