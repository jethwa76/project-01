import mongoose from "mongoose";
import { env } from "./env.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import Certificate from "../models/Certificate.js";
import Testimonial from "../models/Testimonial.js";
import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";

async function seedIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log("Database is empty. Seeding initial data...");

    const admin = await User.create({
      name: "Portfolio Admin",
      email: "admin@example.com",
      password: "Password123!",
      role: "admin",
      headline: "Full Stack Product Engineer",
      bio: "I build polished, scalable web products with thoughtful UX and resilient backend systems.",
      location: "San Francisco, CA",
      website: "https://showcasepro.dev"
    });

    const testUser = await User.create({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Password123!",
      role: "user",
      headline: "Frontend UI/UX Developer",
      bio: "Passionate about creating accessible, beautiful and high-performing web interfaces.",
      location: "New York, NY",
      website: "https://janedoe.com"
    });

    const skills = await Skill.create([
      { name: "React / Next.js", category: "Frontend", level: 94, color: "#2563EB" },
      { name: "Node.js / Express", category: "Backend", level: 91, color: "#14B8A6" },
      { name: "MongoDB / Mongoose", category: "Database", level: 86, color: "#10B981" },
      { name: "System Design", category: "Architecture", level: 89, color: "#F59E0B" }
    ]);

    const projects = await Project.create([
      {
        title: "Talent Signal Hub",
        summary: "Recruiter-friendly project profiles with achievements, skills, and measurable impact.",
        description: "A secure, role-based platform that turns candidate experience into verified talent signals.",
        category: "Career Platform",
        tags: ["recruitment", "portfolio", "verification"],
        technologies: ["JWT", "Tailwind", "Mongoose"],
        demoUrl: "https://example.com",
        repoUrl: "https://github.com/example/talentsignal",
        featured: true,
        owner: admin._id
      }
    ]);

    await Certificate.create([
      {
        title: "Cloud Architecture Professional",
        issuer: "Example Cloud",
        issuedAt: new Date("2025-04-15"),
        credentialUrl: "https://example.com/certificate"
      },
      {
        title: "Advanced React Patterns",
        issuer: "Frontend Masters",
        issuedAt: new Date("2026-01-10"),
        credentialUrl: "https://example.com/react-cert"
      }
    ]);

    await Testimonial.create({
      name: "Maya Chen",
      role: "VP Product",
      company: "Northstar Labs",
      quote: "The platform brought our project story, hiring brand, and technical credibility into one polished experience.",
      rating: 5
    });



    // Create notifications
    await Notification.create([
      {
        user: admin._id,
        type: "system",
        title: "Welcome to ShowcasePro",
        body: "Your admin account is ready. You can now manage projects, certificates, messages, and more.",
        read: false
      },
      {
        user: admin._id,
        type: "message",
        title: "New Inquiry Recieved",
        body: "You have a new message from Maya Chen regarding your LaunchOps Dashboard project.",
        read: false
      },
      {
        user: testUser._id,
        type: "system",
        title: "Welcome Jane!",
        body: "Thanks for registering at ShowcasePro. Explore the dashboard to update your profile.",
        read: false
      }
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export async function connectDatabase() {
  mongoose.set("strictQuery", true);

  try {
    const connection = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
    await seedIfEmpty();
  } catch (err) {
    console.warn(`Could not connect to MongoDB at ${env.mongoUri}: ${err.message}`);
    console.log("Starting in-memory MongoDB for development...");

    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const connection = await mongoose.connect(uri);
    console.log(`In-memory MongoDB connected: ${connection.connection.host}`);
    console.log("⚠️  Data will not persist after server restart.");
    await seedIfEmpty();
  }
}
