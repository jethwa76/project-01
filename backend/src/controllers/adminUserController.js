import User from "../models/User.js";
import Session from "../models/Session.js";
import ActivityLog from "../models/ActivityLog.js";
import Project from "../models/Project.js";
import Blog from "../models/Blog.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";

// Get paginated users list
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).sort("-createdAt"),
    User.countDocuments(query)
  ]);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users
  });
});

// Admin creates/adds a user
export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "User with this email already exists."));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "visitor",
    emailVerified: true // Admin-created users are pre-verified by default
  });

  await logActivity(req, {
    userId: user._id,
    email: user.email,
    action: "admin_create_user",
    status: "success",
    details: { createdUserEmail: user.email, role: user.role }
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified
    }
  });
});

// Get user details, active sessions, activity logs and creations
export const getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, "User not found."));

  const [sessions, logs, projects, blogs] = await Promise.all([
    Session.find({ user: user._id }).sort("-lastActive"),
    ActivityLog.find({ user: user._id }).sort("-timestamp").limit(100),
    Project.find({ owner: user._id }).sort("-createdAt"),
    Blog.find({ author: user._id }).sort("-createdAt")
  ]);

  res.json({
    success: true,
    data: {
      user,
      sessions,
      logs,
      works: {
        projects,
        blogs
      }
    }
  });
});

// Update user role
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!role || !["visitor", "editor", "admin"].includes(role)) {
    return next(new ApiError(400, "Invalid role."));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );
  if (!user) return next(new ApiError(404, "User not found."));

  await logActivity(req, {
    userId: req.user._id,
    email: req.user.email,
    action: "admin_update_user_role",
    status: "success",
    details: { targetUserId: user._id, targetUserEmail: user.email, newRole: role }
  });

  res.json({ success: true, data: user });
});

// Delete/Disable user
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, "User not found."));

  // Prevent self-deletion
  if (user._id.toString() === req.user._id.toString()) {
    return next(new ApiError(400, "You cannot delete yourself."));
  }

  await user.deleteOne();
  await Session.deleteMany({ user: user._id }); // Kill all sessions for this user

  await logActivity(req, {
    userId: req.user._id,
    email: req.user.email,
    action: "admin_delete_user",
    status: "success",
    details: { deletedUserId: user._id, deletedUserEmail: user.email }
  });

  res.json({ success: true, message: "User and all active sessions deleted successfully." });
});
