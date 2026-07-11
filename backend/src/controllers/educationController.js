import Education from "../models/Education.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getEducation = asyncHandler(async (_req, res) => {
  const education = await Education.find({ visible: true }).sort({ order: 1, startDate: -1 });
  res.json({ success: true, data: education });
});

export const getAllEducation = asyncHandler(async (_req, res) => {
  const education = await Education.find().sort({ order: 1, startDate: -1 });
  res.json({ success: true, data: education });
});

export const getEducationById = asyncHandler(async (req, res, next) => {
  const edu = await Education.findById(req.params.id);
  if (!edu) return next(new ApiError(404, "Education record not found."));
  res.json({ success: true, data: edu });
});

export const createEducation = asyncHandler(async (req, res) => {
  const edu = await Education.create(req.body);
  res.status(201).json({ success: true, data: edu });
});

export const updateEducation = asyncHandler(async (req, res, next) => {
  const edu = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!edu) return next(new ApiError(404, "Education record not found."));
  res.json({ success: true, data: edu });
});

export const deleteEducation = asyncHandler(async (req, res, next) => {
  const edu = await Education.findByIdAndDelete(req.params.id);
  if (!edu) return next(new ApiError(404, "Education record not found."));
  res.json({ success: true, message: "Education deleted." });
});
