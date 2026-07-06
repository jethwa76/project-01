import { env } from "../config/env.js";

export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || "Internal server error"
  };

  if (err.details) payload.details = err.details;
  if (env.nodeEnv === "development") payload.stack = err.stack;

  if (err.name === "CastError") {
    payload.message = "Invalid resource identifier.";
  }
  if (err.code === 11000) {
    payload.message = "Duplicate field value entered.";
  }
  if (err.name === "JsonWebTokenError") {
    payload.message = "Invalid token. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    payload.message = "Your token has expired. Please log in again.";
  }

  res.status(statusCode).json(payload);
}
