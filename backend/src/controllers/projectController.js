import Project from "../models/Project.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./crudController.js";

export const getProjects = getAll(Project, ["title", "summary", "category", "tags"], "owner");
export const getProject = getOne(Project, "owner");
export const createProject = createOne(Project);
export const updateProject = updateOne(Project, ["title", "summary", "description", "category", "status", "tags", "technologies", "demoUrl", "repoUrl", "featured", "image", "gallery"]);
export const deleteProject = deleteOne(Project);

export const likeProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ApiError(404, "Project not found."));

  const exists = project.likes.some((id) => id.toString() === req.user._id.toString());
  project.likes = exists
    ? project.likes.filter((id) => id.toString() !== req.user._id.toString())
    : [...project.likes, req.user._id];
  await project.save();
  res.json({ success: true, likes: project.likes.length });
});

