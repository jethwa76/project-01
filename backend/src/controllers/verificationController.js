import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import VerificationDocument from "../models/VerificationDocument.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";

import { env } from "../config/env.js";

// Helper to upload buffers to Cloudinary supporting PDF, Word, and images
function uploadStream(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    if (!env.cloudinary.apiKey || !env.cloudinary.cloudName) {
      console.warn("⚠️ Cloudinary is not configured. Falling back to local development mock URL.");
      return resolve({
        secure_url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
        public_id: "mock-local-doc"
      });
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(fileBuffer).pipe(stream);
  });
}

// User: Submit verification document
export const submitVerification = asyncHandler(async (req, res, next) => {
  const { documentType } = req.body;
  if (!documentType) {
    return next(new ApiError(400, "Document type is required."));
  }

  const allowedTypes = ["Student ID", "College ID", "Government ID", "Resume", "Certificate"];
  if (!allowedTypes.includes(documentType)) {
    return next(new ApiError(400, "Invalid document type."));
  }

  if (!req.file) {
    return next(new ApiError(400, "Please provide a document file."));
  }

  // Upload to Cloudinary
  const result = await uploadStream(req.file.buffer, "portfolio-verifications");

  const verification = await VerificationDocument.create({
    user: req.user._id,
    documentType,
    file: {
      url: result.secure_url,
      publicId: result.public_id
    },
    status: "pending"
  });

  await logActivity(req, {
    userId: req.user._id,
    email: req.user.email,
    action: "verification_submitted",
    status: "success",
    details: { docId: verification._id, documentType }
  });

  res.status(201).json({
    success: true,
    data: verification
  });
});

// User: Get own verification documents
export const getMyVerifications = asyncHandler(async (req, res) => {
  const verifications = await VerificationDocument.find({ user: req.user._id }).sort("-createdAt");
  res.json({
    success: true,
    data: verifications
  });
});

// Admin: Get all verifications with searching/filtering/pagination
export const adminGetVerifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.documentType) {
    query.documentType = req.query.documentType;
  }

  // If search is provided, look up users first
  if (req.query.search) {
    const matchedUsers = await User.find({
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } }
      ]
    }).select("_id");
    query.user = { $in: matchedUsers.map(u => u._id) };
  }

  const [verifications, total] = await Promise.all([
    VerificationDocument.find(query)
      .populate("user", "name email avatar")
      .populate("reviewedBy", "name email")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt"),
    VerificationDocument.countDocuments(query)
  ]);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: verifications
  });
});

// Admin: Review verification document (approve, reject, changes_requested)
export const adminReviewVerification = asyncHandler(async (req, res, next) => {
  const { status, remarks } = req.body;

  if (!status || !["approved", "rejected", "changes_requested"].includes(status)) {
    return next(new ApiError(400, "Invalid verification status."));
  }

  const doc = await VerificationDocument.findById(req.params.id);
  if (!doc) {
    return next(new ApiError(404, "Verification document not found."));
  }

  doc.status = status;
  doc.remarks = remarks || "";
  doc.reviewedBy = req.user._id;
  doc.reviewedAt = new Date();
  await doc.save();

  // Log admin action
  await logActivity(req, {
    userId: req.user._id,
    email: req.user.email,
    action: `verification_${status}`,
    status: "success",
    details: { targetDocId: doc._id, targetUserId: doc.user, remarks }
  });

  // Notify the user in-app
  const statusLabels = {
    approved: "Approved",
    rejected: "Rejected",
    changes_requested: "Changes Requested"
  };

  await Notification.create({
    user: doc.user,
    type: "system",
    title: `Verification Document ${statusLabels[status]}`,
    body: `Your verification document (${doc.documentType}) has been reviewed. Status: ${statusLabels[status]}. ${remarks ? `Remarks: "${remarks}"` : ""}`,
    link: "/dashboard/verification"
  });

  res.json({
    success: true,
    data: doc
  });
});
