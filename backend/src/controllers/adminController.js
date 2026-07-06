import User from "../models/User.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import Certificate from "../models/Certificate.js";
import Testimonial from "../models/Testimonial.js";
import Message from "../models/Message.js";
import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardOverview = asyncHandler(async (_req, res) => {
  const [users, projects, skills, certificates, testimonials, messages, blogs, notifications] =
    await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Skill.countDocuments(),
      Certificate.countDocuments(),
      Testimonial.countDocuments(),
      Message.countDocuments(),
      Blog.countDocuments(),
      Notification.countDocuments()
    ]);

  const recentMessages = await Message.find().sort("-createdAt").limit(5);
  const popularProjects = await Project.find().sort("-views -createdAt").limit(5);

  res.json({
    success: true,
    metrics: { users, projects, skills, certificates, testimonials, messages, blogs, notifications },
    recentMessages,
    popularProjects
  });
});
