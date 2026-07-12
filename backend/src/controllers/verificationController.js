import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import VerificationDocument from "../models/VerificationDocument.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";

// Helper to stream upload to Cloudinary (supports image and PDF auto-detection)
function uploadStream(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
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

// @desc    Upload verification document
// @route   POST /api/verification/upload
// @access  Private
export const uploadDocument = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, "Please provide a document or image file."));
  }

  const { type } = req.body;
  const validTypes = ["student_id", "college_id", "govt_id", "resume", "certificate", "other"];
  if (!type || !validTypes.includes(type)) {
    return next(new ApiError(400, `Please provide a valid document type: ${validTypes.join(", ")}`));
  }

  // Upload to Cloudinary
  const result = await uploadStream(req.file.buffer, "verification-documents");

  // Create verification document entry
  const document = await VerificationDocument.create({
    user: req.user._id,
    type,
    url: result.secure_url,
    publicId: result.public_id,
    status: "pending"
  });

  await logActivity(req, {
    userId: req.user._id,
    email: req.user.email,
    action: "document_uploaded",
    status: "success",
    details: { documentId: document._id, type }
  });

  res.status(201).json({
    success: true,
    data: document
  });
});

// @desc    Get logged in user's verification documents
// @route   GET /api/verification/my-docs
// @access  Private
export const getMyDocuments = asyncHandler(async (req, res) => {
  const documents = await VerificationDocument.find({ user: req.user._id }).sort("-createdAt");
  res.json({
    success: true,
    data: documents
  });
});

// @desc    Delete a verification document
// @route   DELETE /api/verification/:id
// @access  Private
export const deleteDocument = asyncHandler(async (req, res, next) => {
  const doc = await VerificationDocument.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    return next(new ApiError(404, "Document not found."));
  }

  // Only allow deleting non-approved documents
  if (doc.status === "approved") {
    return next(new ApiError(400, "Approved documents cannot be deleted."));
  }

  // Delete from Cloudinary
  // Determine resource type: PDF is raw, images are image
  const resourceType = doc.url.endsWith(".pdf") ? "raw" : "image";
  try {
    await cloudinary.uploader.destroy(doc.publicId, { resource_type: resourceType });
  } catch (err) {
    console.error("Cloudinary destroy error:", err);
  }

  await doc.deleteOne();

  await logActivity(req, {
    userId: req.user._id,
    email: req.user.email,
    action: "document_deleted",
    status: "success",
    details: { documentId: doc._id }
  });

  res.json({
    success: true,
    message: "Document deleted successfully."
  });
});

// @desc    Get all verification documents (Admin only)
// @route   GET /api/verification/admin/all
// @access  Private/Admin
export const adminGetAllDocuments = asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    VerificationDocument.find(filter)
      .populate("user", "name email avatar isVerified")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    VerificationDocument.countDocuments(filter)
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: documents
  });
});

// @desc    Review a verification document (Admin only)
// @route   PATCH /api/verification/admin/review/:id
// @access  Private/Admin
export const adminReviewDocument = asyncHandler(async (req, res, next) => {
  const { status, adminRemarks } = req.body;
  const validStatuses = ["approved", "rejected", "needs_changes"];

  if (!status || !validStatuses.includes(status)) {
    return next(new ApiError(400, `Please provide a valid review status: ${validStatuses.join(", ")}`));
  }

  const doc = await VerificationDocument.findById(req.params.id);
  if (!doc) {
    return next(new ApiError(404, "Document not found."));
  }

  doc.status = status;
  doc.adminRemarks = adminRemarks || "";
  doc.reviewedBy = req.user._id;
  doc.reviewedAt = new Date();
  await doc.save();

  // If approved, update user's verification status
  if (status === "approved") {
    await User.findByIdAndUpdate(doc.user, { isVerified: true });
  } else {
    // If not approved, check if they have any other approved document
    const otherApproved = await VerificationDocument.findOne({
      user: doc.user,
      status: "approved",
      _id: { $ne: doc._id }
    });
    if (!otherApproved) {
      await User.findByIdAndUpdate(doc.user, { isVerified: false });
    }
  }

  // Create notifications
  const userMessage = status === "approved"
    ? "Your verification document has been approved! Your profile is now verified."
    : `Your verification document review status: ${status.replace("_", " ")}. Remarks: ${adminRemarks || "None"}`;

  await Notification.create({
    user: doc.user,
    type: "security",
    title: `Verification document ${status}`,
    body: userMessage,
    link: "/dashboard/verification"
  });

  await logActivity(req, {
    userId: req.user._id,
    email: req.user.email,
    action: "document_reviewed",
    status: "success",
    details: { documentId: doc._id, targetUserId: doc.user, reviewStatus: status }
  });

  res.json({
    success: true,
    data: doc
  });
});
