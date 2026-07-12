import Visitor from "../models/Visitor.js";
import { parseUserAgent } from "../utils/activityLogger.js";

export const trackVisitor = async (req, res, next) => {
  // We run visitor tracking asynchronously to avoid slowing down API requests.
  // Only log if the request is not coming from a local health check or static check.
  const ip = req.ip || req.connection?.remoteAddress || "";
  const userAgent = req.headers?.["user-agent"] || "";

  if (ip && userAgent && !userAgent.includes("Mozilla/5.0 (compatible;")) {
    try {
      const { browser, os, device } = parseUserAgent(userAgent);

      // Perform an upsert: find existing by ip + userAgent
      // If found, update lastSeen. If not found, create new.
      await Visitor.findOneAndUpdate(
        { ip, userAgent },
        {
          $set: { browser, os, device, lastSeen: new Date() },
          $setOnInsert: { ip, userAgent }
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      // Log error internally but do not crash the request lifecycle
      console.error("Error logging visitor:", error.message);
    }
  }

  next();
};
