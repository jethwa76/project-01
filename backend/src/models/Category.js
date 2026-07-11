import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    type: { type: String, enum: ["project", "blog", "skill"], required: true },
    description: { type: String, maxlength: 300 },
    color: { type: String, default: "#2563eb" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Category", categorySchema);
