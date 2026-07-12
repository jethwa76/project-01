import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { filterXSS } from "xss";

/**
 * Recursively sanitize all string values in an object using the `xss` library.
 * This replaces the deprecated `xss-clean` middleware with a maintained,
 * actively developed alternative.
 */
function sanitizeValue(value) {
  if (typeof value === "string") {
    return filterXSS(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
}

/**
 * Express middleware that sanitizes req.body, req.query, and req.params
 * against XSS attacks using the `xss` library (actively maintained).
 */
function xssSanitize() {
  return (req, _res, next) => {
    if (req.body) req.body = sanitizeValue(req.body);
    if (req.query) req.query = sanitizeValue(req.query);
    if (req.params) req.params = sanitizeValue(req.params);
    next();
  };
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later."
  }
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 messages per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages sent from this IP. Please try again in an hour."
  }
});

export function securityMiddleware(app) {
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(xssSanitize());
}
