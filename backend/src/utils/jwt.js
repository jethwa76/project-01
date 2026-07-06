import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function sendToken(user, statusCode, res) {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + env.jwtCookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "strict",
    secure: env.nodeEnv === "production"
  };

  res.cookie("token", token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
}
