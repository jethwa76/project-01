import mongoose from "mongoose";
import slugify from "slugify";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required."],
      trim: true,
      maxlength: 120
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    summary: {
      type: String,
      required: [true, "Project summary is required."],
      maxlength: 300
    },
    description: {
      type: String,
      required: [true, "Project description is required."]
    },
    category: {
      type: String,
      default: "Web Application"
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published"
    },
    tags: [String],
    technologies: [String],
    image: {
      url: String,
      publicId: String
    },
    gallery: [
      {
        url: String,
        publicId: String
      }
    ],
    demoUrl: String,
    repoUrl: String,
    featured: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

projectSchema.pre("save", async function createSlug(next) {
  if (this.isModified("title")) {
    let generatedSlug = slugify(this.title, { lower: true, strict: true });
    let slugExists = await mongoose.model("Project").findOne({ slug: generatedSlug, _id: { $ne: this._id } });
    while (slugExists) {
      const suffix = Math.random().toString(36).substring(2, 6);
      generatedSlug = `${slugify(this.title, { lower: true, strict: true })}-${suffix}`;
      slugExists = await mongoose.model("Project").findOne({ slug: generatedSlug, _id: { $ne: this._id } });
    }
    this.slug = generatedSlug;
  }
  next();
});

export default mongoose.model("Project", projectSchema);
