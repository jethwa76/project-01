import Category from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCategories = asyncHandler(async (req, res) => {
  const filter = req.query.type ? { type: req.query.type } : {};
  const categories = await Category.find(filter).sort({ order: 1, name: 1 });
  res.json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!cat) return next(new ApiError(404, "Category not found."));
  res.json({ success: true, data: cat });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) return next(new ApiError(404, "Category not found."));
  res.json({ success: true, message: "Category deleted." });
});
