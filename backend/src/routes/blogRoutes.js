import express from "express";
import {
  addComment,
  createBlog,
  deleteBlog,
  getBlog,
  getBlogBySlug,
  getBlogs,
  toggleBlogReaction,
  updateBlog
} from "../controllers/blogController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { blogRules } from "../validators/resourceValidators.js";

const router = express.Router();

router.route("/").get(getBlogs).post(protect, authorize("admin"), blogRules, validate, createBlog);
router.get("/slug/:slug", getBlogBySlug);
router.post("/:id/comments", protect, addComment);
router.patch("/:id/like", protect, toggleBlogReaction("likes"));
router.patch("/:id/bookmark", protect, toggleBlogReaction("bookmarks"));
router
  .route("/:id")
  .get(getBlog)
  .put(protect, authorize("admin"), blogRules, validate, updateBlog)
  .patch(protect, authorize("admin"), updateBlog)
  .delete(protect, authorize("admin"), deleteBlog);

export default router;
