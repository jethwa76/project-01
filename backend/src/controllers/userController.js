import User from "../models/User.js";
import Project from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOne, getAll, getOne, updateOne } from "./crudController.js";

export const getUsers = getAll(User, ["name", "email", "headline"]);
export const getUser = getOne(User);
export const updateUser = updateOne(User, ["name", "email", "role", "headline", "bio", "location", "website", "avatar", "emailVerified"]);
export const deleteUser = deleteOne(User);

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "headline", "bio", "location", "website", "avatar"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key))
  );
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  });
  res.json({ success: true, user });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new ApiError(401, "Current password is incorrect."));
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, message: "Password changed successfully." });
});

export const toggleProjectList = (field) =>
  asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) return next(new ApiError(404, "Project not found."));

    const user = await User.findById(req.user._id);
    const exists = user[field].some((id) => id.toString() === req.params.projectId);
    user[field] = exists
      ? user[field].filter((id) => id.toString() !== req.params.projectId)
      : [...user[field], project._id];
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, [field]: user[field] });
  });

export const getAdminProfile = asyncHandler(async (req, res, next) => {
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    return next(new ApiError(404, "Admin profile not found."));
  }
  res.json({ success: true, data: admin });
});
