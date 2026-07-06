import crypto from "crypto";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/email.js";
import { env } from "../config/env.js";

export const register = asyncHandler(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  sendToken(user, 201, res);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError(401, "Invalid email or password."));
  }

  sendToken(user, 200, res);
});

export const logout = (_req, res) => {
  res.cookie("token", "logged-out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.json({ success: true, message: "Logged out successfully." });
};

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ApiError(404, "No user found with that email."));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.resetPasswordUrl}/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your portfolio account password",
    message: `Use this link to reset your password: ${resetUrl}`
  });

  const responseData = { success: true, message: "Password reset instructions sent." };
  if (env.nodeEnv === "development") {
    responseData.resetUrl = resetUrl;
  }

  res.json(responseData);
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) return next(new ApiError(400, "Reset token is invalid or has expired."));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(user, 200, res);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
