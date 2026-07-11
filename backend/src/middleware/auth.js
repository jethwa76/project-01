import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { env } from "../config/env.js";

export const protect = asyncHandler(async (req, _res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ApiError(401, "Please log in to access this resource."));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("+passwordChangedAt");
    if (!user) {
      return next(new ApiError(401, "The user belonging to this token no longer exists."));
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new ApiError(401, "Password was changed recently. Please log in again."));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token. Please log in again."));
  }
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action."));
  }
  next();
};

export const checkPermission = (permission) => asyncHandler(async (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Please log in to access this resource."));
  }
  // Admin gets a bypass
  if (req.user.role === "admin") {
    return next();
  }

  const roleData = await Role.findOne({ name: req.user.role });
  if (!roleData || !roleData.permissions[permission]) {
    return next(new ApiError(403, "You do not have permission to perform this action."));
  }
  next();
});

