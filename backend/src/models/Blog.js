import mongoose from "mongoose";
import slugify from "slugify";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 800 }
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, required: true, maxlength: 240 },
    body: { type: String, required: true },
    coverImage: {
      url: String,
      publicId: String
    },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published"
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema]
  },
  { timestamps: true }
);

blogSchema.pre("save", async function createSlug(next) {
  if (this.isModified("title")) {
    let generatedSlug = slugify(this.title, { lower: true, strict: true });
    let slugExists = await mongoose.model("Blog").findOne({ slug: generatedSlug, _id: { $ne: this._id } });
    while (slugExists) {
      const suffix = Math.random().toString(36).substring(2, 6);
      generatedSlug = `${slugify(this.title, { lower: true, strict: true })}-${suffix}`;
      slugExists = await mongoose.model("Blog").findOne({ slug: generatedSlug, _id: { $ne: this._id } });
    }
    this.slug = generatedSlug;
  }
  next();
});

export default mongoose.model("Blog", blogSchema);
