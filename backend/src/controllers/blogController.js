import Blog from "../models/Blog.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./crudController.js";

export const getBlogs = getAll(Blog, ["title", "excerpt", "tags"], "author");
export const getBlog = getOne(Blog, "author comments.user");
export const createBlog = createOne(Blog);
export const updateBlog = updateOne(Blog, ["title", "excerpt", "body", "coverImage", "tags", "status"]);
export const deleteBlog = deleteOne(Blog);

export const getBlogBySlug = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate("author", "name avatar headline")
    .populate("comments.user", "name avatar");
  if (!blog) return next(new ApiError(404, "Blog not found."));
  res.json({ success: true, data: blog });
});

export const addComment = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return next(new ApiError(404, "Blog not found."));
  blog.comments.push({ user: req.user._id, body: req.body.body });
  await blog.save();
  res.status(201).json({ success: true, comments: blog.comments });
});

export const toggleBlogReaction = (field) =>
  asyncHandler(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(new ApiError(404, "Blog not found."));
    const exists = blog[field].some((id) => id.toString() === req.user._id.toString());
    blog[field] = exists
      ? blog[field].filter((id) => id.toString() !== req.user._id.toString())
      : [...blog[field], req.user._id];
    await blog.save();
    res.json({ success: true, [field]: blog[field].length });
  });
