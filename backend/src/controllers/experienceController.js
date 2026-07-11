import Experience from "../models/Experience.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getExperiences = asyncHandler(async (_req, res) => {
  const experiences = await Experience.find({ visible: true }).sort({ order: 1, startDate: -1 });
  res.json({ success: true, data: experiences });
});

export const getAllExperiences = asyncHandler(async (_req, res) => {
  const experiences = await Experience.find().sort({ order: 1, startDate: -1 });
  res.json({ success: true, data: experiences });
});

export const getExperience = asyncHandler(async (req, res, next) => {
  const experience = await Experience.findById(req.params.id);
  if (!experience) return next(new ApiError(404, "Experience not found."));
  res.json({ success: true, data: experience });
});

export const createExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.create(req.body);
  res.status(201).json({ success: true, data: experience });
});

export const updateExperience = asyncHandler(async (req, res, next) => {
  const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!experience) return next(new ApiError(404, "Experience not found."));
  res.json({ success: true, data: experience });
});

export const deleteExperience = asyncHandler(async (req, res, next) => {
  const experience = await Experience.findByIdAndDelete(req.params.id);
  if (!experience) return next(new ApiError(404, "Experience not found."));
  res.json({ success: true, message: "Experience deleted." });
});
