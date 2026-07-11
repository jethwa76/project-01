import Download from "../models/Download.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDownloads = asyncHandler(async (req, res) => {
  const filter = req.query.resourceType ? { resourceType: req.query.resourceType } : {};
  const downloads = await Download.find(filter).sort({ downloadedAt: -1 }).limit(100);
  res.json({ success: true, data: downloads });
});

export const trackDownload = asyncHandler(async (req, res) => {
  const { resource, resourceType, resourceId } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];

  const download = await Download.create({
    resource,
    resourceType,
    resourceId,
    ip,
    userAgent
  });

  res.status(201).json({ success: true, data: download });
});
