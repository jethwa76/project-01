import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["admin", "editor", "visitor"]
    },
    description: {
      type: String,
      default: ""
    },
    permissions: {
      // Content management
      createProject: { type: Boolean, default: false },
      editProject: { type: Boolean, default: false },
      deleteProject: { type: Boolean, default: false },
      publishProject: { type: Boolean, default: false },

      createBlog: { type: Boolean, default: false },
      editBlog: { type: Boolean, default: false },
      deleteBlog: { type: Boolean, default: false },
      publishBlog: { type: Boolean, default: false },

      manageSkills: { type: Boolean, default: false },
      manageCertificates: { type: Boolean, default: false },
      manageExperience: { type: Boolean, default: false },
      manageEducation: { type: Boolean, default: false },

      // Moderation
      manageTestimonials: { type: Boolean, default: false },
      manageMessages: { type: Boolean, default: false },
      manageUsers: { type: Boolean, default: false },

      // System
      viewAnalytics: { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false },
      manageRoles: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// Seed default roles
roleSchema.statics.seedDefaults = async function seedDefaults() {
  const count = await this.countDocuments();
  if (count > 0) return;

  await this.create([
    {
      name: "admin",
      description: "Full access to all features and settings.",
      permissions: {
        createProject: true, editProject: true, deleteProject: true, publishProject: true,
        createBlog: true, editBlog: true, deleteBlog: true, publishBlog: true,
        manageSkills: true, manageCertificates: true, manageExperience: true, manageEducation: true,
        manageTestimonials: true, manageMessages: true, manageUsers: true,
        viewAnalytics: true, manageSettings: true, manageRoles: true
      }
    },
    {
      name: "editor",
      description: "Can create and edit content but cannot manage users or settings.",
      permissions: {
        createProject: true, editProject: true, deleteProject: false, publishProject: true,
        createBlog: true, editBlog: true, deleteBlog: false, publishBlog: true,
        manageSkills: true, manageCertificates: true, manageExperience: true, manageEducation: true,
        manageTestimonials: false, manageMessages: false, manageUsers: false,
        viewAnalytics: true, manageSettings: false, manageRoles: false
      }
    },
    {
      name: "visitor",
      description: "Can view public content, save/favorite projects, and leave testimonials.",
      permissions: {
        createProject: false, editProject: false, deleteProject: false, publishProject: false,
        createBlog: false, editBlog: false, deleteBlog: false, publishBlog: false,
        manageSkills: false, manageCertificates: false, manageExperience: false, manageEducation: false,
        manageTestimonials: false, manageMessages: false, manageUsers: false,
        viewAnalytics: false, manageSettings: false, manageRoles: false
      }
    }
  ]);

  console.log("✅ Default roles seeded");
};

export default mongoose.model("Role", roleSchema);
