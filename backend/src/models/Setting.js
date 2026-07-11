import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    // Hero Section
    hero: {
      title: { type: String, default: "Full Stack Developer" },
      subtitle: { type: String, default: "Building Modern Web Applications" },
      description: { type: String, default: "" },
      ctaText: { type: String, default: "View Projects" },
      ctaLink: { type: String, default: "/projects" },
      backgroundImage: { url: String, publicId: String }
    },
    // Contact Details
    contact: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      mapUrl: { type: String, default: "" }
    },
    // Social Links
    social: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      leetcode: { type: String, default: "" },
      codeforces: { type: String, default: "" },
      portfolio: { type: String, default: "" }
    },
    // Resume
    resume: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      lastUpdated: Date
    },
    // SEO Defaults
    seo: {
      siteTitle: { type: String, default: "ShowcasePro Portfolio" },
      siteDescription: { type: String, default: "A modern developer portfolio" },
      ogImage: { url: String, publicId: String },
      keywords: [String]
    },
    // Integration usernames (for Phase 5)
    integrations: {
      githubUsername: { type: String, default: "" },
      leetcodeUsername: { type: String, default: "" },
      codeforcesHandle: { type: String, default: "" },
      linkedinProfileUrl: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

// Singleton pattern — only one settings document
settingSchema.statics.getInstance = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model("Setting", settingSchema);
