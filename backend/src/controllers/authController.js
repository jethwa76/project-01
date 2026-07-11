import crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendTokens, signAccessToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/email.js";
import { env } from "../config/env.js";
import { logActivity } from "../utils/activityLogger.js";

// ────────────────────────────── Register ──────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ name, email, password });

  // Generate email verification token
  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${env.verifyEmailUrl}/${verifyToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your email — ShowcasePro",
      html: buildVerificationEmail(user.name, verifyUrl)
    });
  } catch (err) {
    console.error("Failed to send verification email:", err.message);
    // Don't block registration if email fails
  }

  await sendTokens(user, 201, req, res);
  await logActivity(req, { userId: user._id, email: user.email, action: "register", status: "success" });
});

// ────────────────────────────── Login ──────────────────────────────
export const login = asyncHandler(async (req, res, next) => {
  const { email, password, rememberMe, twoFactorCode } = req.body;

  const user = await User.findOne({ email }).select("+password +twoFactorSecret +twoFactorEnabled");

  if (!user || user.provider !== "local") {
    await logActivity(req, { email, action: "login_failed", status: "failed", details: { error: "Invalid email or provider" } });
    return next(new ApiError(401, "Invalid email or password."));
  }

  if (!(await user.comparePassword(password))) {
    await logActivity(req, { userId: user._id, email: user.email, action: "login_failed", status: "failed", details: { error: "Incorrect password" } });
    return next(new ApiError(401, "Invalid email or password."));
  }

  // 2FA check
  if (user.twoFactorEnabled) {
    if (!twoFactorCode) {
      // Client needs to show the OTP input
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        message: "Two-factor authentication code required."
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: twoFactorCode,
      window: 1
    });

    if (!verified) {
      await logActivity(req, { userId: user._id, email: user.email, action: "login_failed", status: "failed", details: { error: "Invalid 2FA code" } });
      return next(new ApiError(401, "Invalid two-factor authentication code."));
    }
  }

  await sendTokens(user, 200, req, res, !!rememberMe);
  await logActivity(req, { userId: user._id, email: user.email, action: "login_success", status: "success" });
});

// ────────────────────────────── Logout ──────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  // Invalidate the refresh token session
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (refreshToken) {
    const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const session = await Session.findOne({ refreshToken: hashedToken }).populate("user");
    if (session && session.user) {
      await logActivity(req, { userId: session.user._id, email: session.user.email, action: "logout", status: "success" });
    }
    await Session.deleteOne({ refreshToken: hashedToken });
  }

  res.cookie("token", "logged-out", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });
  res.cookie("refreshToken", "logged-out", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    path: "/api/auth/refresh-token"
  });

  res.json({ success: true, message: "Logged out successfully." });
});

// ────────────────────────────── Refresh Token ──────────────────────────────
export const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    return next(new ApiError(401, "No refresh token provided."));
  }

  // Verify the JWT
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtRefreshSecret);
  } catch {
    return next(new ApiError(401, "Invalid or expired refresh token."));
  }

  // Check that a session exists with this hashed token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const session = await Session.findOne({ refreshToken: hashedToken, user: decoded.id });

  if (!session) {
    // Possible token reuse — invalidate all sessions for this user
    await Session.deleteMany({ user: decoded.id });
    return next(new ApiError(401, "Refresh token has been revoked. Please log in again."));
  }

  // Check user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    await session.deleteOne();
    return next(new ApiError(401, "User no longer exists."));
  }

  // Issue new access token (rotate refresh token for security)
  const newAccessToken = signAccessToken(user._id);

  // Update session last active
  session.lastActive = new Date();
  await session.save();

  res.cookie("token", newAccessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: env.nodeEnv === "production",
    expires: new Date(Date.now() + 15 * 60 * 1000)
  });

  res.json({ success: true, token: newAccessToken });
});

// ────────────────────────────── Email Verification ──────────────────────────────
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    return next(new ApiError(400, "Verification token is invalid or has expired."));
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: "Email verified successfully." });
});

export const resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.emailVerified) {
    return next(new ApiError(400, "Email is already verified."));
  }

  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${env.verifyEmailUrl}/${verifyToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email — ShowcasePro",
    html: buildVerificationEmail(user.name, verifyUrl)
  });

  res.json({ success: true, message: "Verification email sent." });
});

// ────────────────────────────── Forgot / Reset Password ──────────────────────────────
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ApiError(404, "No user found with that email."));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.resetPasswordUrl}/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your password — ShowcasePro",
    html: buildPasswordResetEmail(user.name, resetUrl)
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

  // Invalidate all existing sessions on password reset
  await Session.deleteMany({ user: user._id });

  await sendTokens(user, 200, req, res);
});

// ────────────────────────────── Change Password ──────────────────────────────
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    return next(new ApiError(401, "Current password is incorrect."));
  }

  user.password = newPassword;
  await user.save();

  // Invalidate all sessions except current
  const currentRefreshToken = req.cookies?.refreshToken;
  if (currentRefreshToken) {
    const hashedCurrent = crypto.createHash("sha256").update(currentRefreshToken).digest("hex");
    await Session.deleteMany({
      user: user._id,
      refreshToken: { $ne: hashedCurrent }
    });
  } else {
    await Session.deleteMany({ user: user._id });
  }

  res.json({ success: true, message: "Password changed successfully." });
});

// ────────────────────────────── Two-Factor Authentication ──────────────────────────────
export const enable2FA = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `${env.twoFactorIssuer} (${req.user.email})`,
    issuer: env.twoFactorIssuer,
    length: 20
  });

  // Save secret temporarily (not enabled until verified)
  await User.findByIdAndUpdate(req.user._id, {
    twoFactorSecret: secret.base32
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    success: true,
    secret: secret.base32,
    qrCode: qrCodeUrl,
    message: "Scan the QR code with your authenticator app, then verify with a code."
  });
});

export const verify2FA = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  const user = await User.findById(req.user._id).select("+twoFactorSecret");
  if (!user.twoFactorSecret) {
    return next(new ApiError(400, "Two-factor authentication has not been set up."));
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1
  });

  if (!verified) {
    return next(new ApiError(400, "Invalid verification code. Please try again."));
  }

  user.twoFactorEnabled = true;
  await user.save({ validateBeforeSave: false });
  await logActivity(req, { userId: user._id, email: user.email, action: "2fa_enabled", status: "success" });

  res.json({ success: true, message: "Two-factor authentication enabled successfully." });
});

export const disable2FA = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  const user = await User.findById(req.user._id).select("+twoFactorSecret");

  if (!user.twoFactorEnabled) {
    return next(new ApiError(400, "Two-factor authentication is not enabled."));
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1
  });

  if (!verified) {
    return next(new ApiError(400, "Invalid code. Cannot disable 2FA."));
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save({ validateBeforeSave: false });
  await logActivity(req, { userId: user._id, email: user.email, action: "2fa_disabled", status: "success" });

  res.json({ success: true, message: "Two-factor authentication disabled." });
});

// ────────────────────────────── Session Management ──────────────────────────────
export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ user: req.user._id })
    .select("device browser os ip lastActive createdAt expiresAt")
    .sort("-lastActive");

  // Mark the current session
  const currentRefreshToken = req.cookies?.refreshToken;
  let currentSessionId = null;
  if (currentRefreshToken) {
    const hashed = crypto.createHash("sha256").update(currentRefreshToken).digest("hex");
    const currentSession = await Session.findOne({ refreshToken: hashed, user: req.user._id });
    if (currentSession) currentSessionId = currentSession._id.toString();
  }

  const sessionsWithCurrent = sessions.map((s) => ({
    ...s.toObject(),
    isCurrent: s._id.toString() === currentSessionId
  }));

  res.json({ success: true, sessions: sessionsWithCurrent });
});

export const revokeSession = asyncHandler(async (req, res, next) => {
  const session = await Session.findOne({ _id: req.params.id, user: req.user._id });

  if (!session) {
    return next(new ApiError(404, "Session not found."));
  }

  await session.deleteOne();
  res.json({ success: true, message: "Session revoked." });
});

export const revokeAllSessions = asyncHandler(async (req, res) => {
  // Keep current session, revoke the rest
  const currentRefreshToken = req.cookies?.refreshToken;
  if (currentRefreshToken) {
    const hashed = crypto.createHash("sha256").update(currentRefreshToken).digest("hex");
    await Session.deleteMany({
      user: req.user._id,
      refreshToken: { $ne: hashed }
    });
  } else {
    await Session.deleteMany({ user: req.user._id });
  }

  res.json({ success: true, message: "All other sessions revoked." });
});

// ────────────────────────────── OAuth Callbacks ──────────────────────────────
export const oauthSuccess = asyncHandler(async (req, res) => {
  const user = req.user;

  const { accessToken, refreshToken: rToken } = await (await import("../utils/jwt.js")).createTokenPair(user, req, false);
  await logActivity(req, { userId: user._id, email: user.email, action: `login_oauth_${user.provider}`, status: "success" });

  // Redirect to frontend with tokens as query params (frontend stores them)
  const redirectUrl = new URL(`${env.frontendUrl}/auth/oauth-callback`);
  redirectUrl.searchParams.set("token", accessToken);
  redirectUrl.searchParams.set("refreshToken", rToken);

  res.redirect(redirectUrl.toString());
});

// ────────────────────────────── Get Current User ──────────────────────────────
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ────────────────────────────── Email Templates ──────────────────────────────
function buildVerificationEmail(name, verifyUrl) {
  return `
    <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:520px;margin:0 auto;padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#2563eb;font-size:28px;margin:0;">ShowcasePro</h1>
      </div>
      <h2 style="color:#1e293b;font-size:22px;">Verify your email</h2>
      <p style="color:#475569;line-height:1.7;font-size:15px;">
        Hi ${name}, thanks for signing up! Please verify your email address by clicking the button below.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
          Verify Email
        </a>
      </div>
      <p style="color:#94a3b8;font-size:13px;">
        This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
      <p style="color:#94a3b8;font-size:12px;text-align:center;">ShowcasePro Portfolio Platform</p>
    </div>
  `;
}

function buildPasswordResetEmail(name, resetUrl) {
  return `
    <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:520px;margin:0 auto;padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#2563eb;font-size:28px;margin:0;">ShowcasePro</h1>
      </div>
      <h2 style="color:#1e293b;font-size:22px;">Reset your password</h2>
      <p style="color:#475569;line-height:1.7;font-size:15px;">
        Hi ${name}, we received a request to reset your password. Click the button below to create a new one.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color:#94a3b8;font-size:13px;">
        This link expires in 10 minutes. If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
      <p style="color:#94a3b8;font-size:12px;text-align:center;">ShowcasePro Portfolio Platform</p>
    </div>
  `;
}
