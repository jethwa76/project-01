import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import Session from "../models/Session.js";

/**
 * Sign a short-lived access token (default 15 min).
 */
export function signAccessToken(userId) {
  return jwt.sign({ id: userId, type: "access" }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

/**
 * Sign a long-lived refresh token (default 7d, 30d for remember-me).
 */
export function signRefreshToken(userId, rememberMe = false) {
  return jwt.sign({ id: userId, type: "refresh" }, env.jwtRefreshSecret, {
    expiresIn: rememberMe ? env.jwtRememberMeExpiresIn : env.jwtRefreshExpiresIn
  });
}

/**
 * Parse a user-agent string into device/browser/OS info.
 */
function parseUserAgent(ua = "") {
  const browser =
    ua.match(/(?:Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)[\/\s][\d.]+/)?.[0] || "Unknown";
  const os =
    ua.match(/(?:Windows NT [\d.]+|Mac OS X [\d_.]+|Linux|Android [\d.]+|iOS [\d.]+)/)?.[0] || "Unknown";
  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
  return { browser, os, device };
}

/**
 * Create a session record and return both tokens.
 */
export async function createTokenPair(user, req, rememberMe = false) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id, rememberMe);

  // Hash refresh token for DB storage
  const hashedRefresh = crypto.createHash("sha256").update(refreshToken).digest("hex");

  // Determine expiry
  const daysValid = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);

  const { browser, os, device } = parseUserAgent(req.headers?.["user-agent"]);
  const ip = req.ip || req.connection?.remoteAddress || "";

  await Session.create({
    user: user._id,
    refreshToken: hashedRefresh,
    device,
    browser,
    os,
    ip,
    userAgent: req.headers?.["user-agent"] || "",
    expiresAt
  });

  return { accessToken, refreshToken, expiresAt };
}

/**
 * Send tokens as HTTP-only cookies + JSON response.
 */
export async function sendTokens(user, statusCode, req, res, rememberMe = false) {
  const { accessToken, refreshToken, expiresAt } = await createTokenPair(user, req, rememberMe);

  const cookieBase = {
    httpOnly: true,
    sameSite: "strict",
    secure: env.nodeEnv === "production"
  };

  // Access token cookie (short-lived)
  res.cookie("token", accessToken, {
    ...cookieBase,
    expires: new Date(Date.now() + 15 * 60 * 1000) // 15 min
  });

  // Refresh token cookie (long-lived)
  res.cookie("refreshToken", refreshToken, {
    ...cookieBase,
    path: "/api/auth/refresh-token",
    expires: expiresAt
  });

  user.password = undefined;
  user.twoFactorSecret = undefined;
  user.refreshToken = undefined;

  res.status(statusCode).json({
    success: true,
    token: accessToken,
    refreshToken,
    user
  });
}

// Backward-compatible alias
export const signToken = signAccessToken;
export const sendToken = sendTokens;
