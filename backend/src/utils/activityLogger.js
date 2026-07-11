import ActivityLog from "../models/ActivityLog.js";

function parseUserAgent(ua = "") {
  const browser =
    ua.match(/(?:Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)[\/\s][\d.]+/)?.[0] || "Unknown";
  const os =
    ua.match(/(?:Windows NT [\d.]+|Mac OS X [\d_.]+|Linux|Android [\d.]+|iOS [\d.]+)/)?.[0] || "Unknown";
  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
  return { browser, os, device };
}

/**
 * Log user activity in the database.
 * @param {Object} req Express request object
 * @param {Object} options Activity details
 * @param {string} options.userId User ObjectId (optional)
 * @param {string} options.email User email (optional fallback)
 * @param {string} options.action Action name (e.g. "login_success")
 * @param {string} options.status Status ("success" or "failed")
 * @param {Object} options.details Additional action-specific details
 */
export async function logActivity(req, { userId, email, action, status, details = {} }) {
  try {
    const userAgent = req.headers?.["user-agent"] || "";
    const { browser, os, device } = parseUserAgent(userAgent);
    const ip = req.ip || req.connection?.remoteAddress || "";

    await ActivityLog.create({
      user: userId || req.user?._id,
      email: email || req.user?.email,
      action,
      status,
      ip,
      userAgent,
      browser,
      os,
      device,
      details
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
