import Tag from "../models/Tag.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTags = asyncHandler(async (req, res) => {
  const filter = req.query.type ? { type: req.query.type } : {};
  const tags = await Tag.find(filter).sort({ count: -1, name: 1 });
  res.json({ success: true, data: tags });
});

export const createTag = asyncHandler(async (req, res) => {
  const tag = await Tag.create(req.body);
  res.status(201).json({ success: true, data: tag });
});

export const updateTag = asyncHandler(async (req, res, next) => {
  const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!tag) return next(new ApiError(404, "Tag not found."));
  res.json({ success: true, data: tag });
});

export const deleteTag = asyncHandler(async (req, res, next) => {
  const tag = await Tag.findByIdAndDelete(req.params.id);
  if (!tag) return next(new ApiError(404, "Tag not found."));
  res.json({ success: true, message: "Tag deleted." });
});
