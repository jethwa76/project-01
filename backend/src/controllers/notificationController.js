import Notification from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./crudController.js";

export const getNotifications = getAll(Notification, ["title", "body"], "user");
export const getNotification = getOne(Notification, "user");
export const createNotification = createOne(Notification);
export const updateNotification = updateOne(Notification, ["read"]);
export const deleteNotification = deleteOne(Notification);

export const myNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort("-createdAt");
  res.json({ success: true, data: notifications });
});

export const markNotificationRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) return next(new ApiError(404, "Notification not found."));
  res.json({ success: true, data: notification });
});

