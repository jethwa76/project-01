import User from "../models/User.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import Certificate from "../models/Certificate.js";
import Testimonial from "../models/Testimonial.js";
import Message from "../models/Message.js";
import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";
import Download from "../models/Download.js";
import ActivityLog from "../models/ActivityLog.js";
import Visitor from "../models/Visitor.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── Dashboard overview ──────────────────────────────────────────────────────
export const dashboardOverview = asyncHandler(async (_req, res) => {
  const [users, projects, skills, certificates, testimonials, messages, blogs, notifications, downloads, visitors] =
    await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Skill.countDocuments(),
      Certificate.countDocuments(),
      Testimonial.countDocuments(),
      Message.countDocuments(),
      Blog.countDocuments(),
      Notification.countDocuments(),
      Download.countDocuments(),
      Visitor.countDocuments()
    ]);

  const recentMessages = await Message.find().sort("-createdAt").limit(5);
  const popularProjects = await Project.find().sort("-views -createdAt").limit(5);

  // Last 7 days download trend (one count per day)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const downloadTrend = await Download.aggregate([
    { $match: { downloadedAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$downloadedAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Last 7 days user registrations trend
  const userTrend = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Last 7 days visitor trend
  const visitorTrend = await Visitor.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    metrics: { users, projects, skills, certificates, testimonials, messages, blogs, notifications, downloads, visitors },
    recentMessages,
    popularProjects,
    trends: { downloads: downloadTrend, users: userTrend, visitors: visitorTrend }
  });
});

// ─── Paginated system / audit logs ───────────────────────────────────────────
export const getSystemLogs = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 25);
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.action) filter.action  = { $regex: req.query.action, $options: "i" };
  if (req.query.status) filter.status  = req.query.status;
  if (req.query.userId) filter.user    = req.query.userId;
  if (req.query.from || req.query.to) {
    filter.timestamp = {};
    if (req.query.from) filter.timestamp.$gte = new Date(req.query.from);
    if (req.query.to)   filter.timestamp.$lte = new Date(req.query.to);
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate("user", "name email avatar")
      .sort("-timestamp")
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(filter)
  ]);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: logs
  });
});

// ─── Recent activity feed (last 20 meaningful events) ────────────────────────
export const getRecentActivity = asyncHandler(async (_req, res) => {
  // Only surface meaningful actions (skip health-check noise)
  const meaningful = [
    "login_success", "logout", "register",
    "login_failed", "2fa_enabled", "2fa_disabled",
    "admin_create_user", "admin_update_user_role", "admin_delete_user",
    "project_created", "project_updated", "project_deleted",
    "blog_created", "blog_updated", "blog_deleted",
    "password_changed", "password_reset"
  ];

  const activity = await ActivityLog.find({ action: { $in: meaningful } })
    .populate("user", "name email avatar")
    .sort("-timestamp")
    .limit(20);

  res.json({ success: true, data: activity });
});
