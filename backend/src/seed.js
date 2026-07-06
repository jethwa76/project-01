import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import User from "./models/User.js";
import Project from "./models/Project.js";
import Skill from "./models/Skill.js";
import Certificate from "./models/Certificate.js";
import Testimonial from "./models/Testimonial.js";
import Blog from "./models/Blog.js";

await connectDatabase();

await Promise.all([
  User.deleteMany(),
  Project.deleteMany(),
  Skill.deleteMany(),
  Certificate.deleteMany(),
  Testimonial.deleteMany(),
  Blog.deleteMany()
]);

const admin = await User.create({
  name: "Portfolio Admin",
  email: "admin@example.com",
  password: "Password123!",
  role: "admin",
  headline: "Full Stack Product Engineer",
  bio: "I build polished, scalable web products with thoughtful UX and resilient backend systems."
});

await Skill.insertMany([
  { name: "React", category: "Frontend", level: 94, color: "#2563EB" },
  { name: "Node.js", category: "Backend", level: 91, color: "#14B8A6" },
  { name: "MongoDB", category: "Database", level: 86, color: "#10B981" },
  { name: "System Design", category: "Architecture", level: 89, color: "#F59E0B" }
]);

await Project.insertMany([
  {
    title: "LaunchOps Dashboard",
    summary: "Analytics dashboard for launch readiness and customer signal tracking.",
    description: "A full-stack product intelligence dashboard with role-based workspaces, charts, and team workflows.",
    category: "SaaS",
    tags: ["analytics", "dashboard", "saas"],
    technologies: ["React", "Node.js", "MongoDB"],
    demoUrl: "https://example.com",
    repoUrl: "https://github.com/example/launchops",
    featured: true,
    owner: admin._id
  },
  {
    title: "Craft Portfolio",
    summary: "Responsive portfolio engine with blogs, project cases, and contact capture.",
    description: "A polished portfolio and content platform built for creators and software professionals.",
    category: "Portfolio",
    tags: ["portfolio", "blog", "cms"],
    technologies: ["Vite", "Express", "Cloudinary"],
    featured: true,
    owner: admin._id
  }
]);

await Certificate.create({
  title: "Cloud Architecture Professional",
  issuer: "Example Cloud",
  issuedAt: new Date("2025-04-15"),
  credentialUrl: "https://example.com/certificate"
});

await Testimonial.create({
  name: "Maya Chen",
  role: "VP Product",
  company: "Northstar Labs",
  quote: "The platform brought our project story, hiring brand, and technical credibility into one polished experience.",
  rating: 5
});

await Blog.create({
  title: "Designing Portfolio Systems That Recruit While You Sleep",
  excerpt: "How to turn projects, writing, and outcomes into a coherent technical brand.",
  body: "A strong portfolio is not a gallery. It is a product surface for trust. Show decisions, constraints, tradeoffs, and measurable outcomes.",
  tags: ["portfolio", "career", "design"],
  author: admin._id
});

console.log("Database seeded. Admin login: admin@example.com / Password123!");
await mongoose.disconnect();
