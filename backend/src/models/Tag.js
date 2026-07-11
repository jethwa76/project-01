import mongoose from "mongoose";
import slugify from "slugify";

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    count: { type: Number, default: 0 },
    type: { type: String, enum: ["project", "blog", "skill", "general"], default: "general" }
  },
  { timestamps: true }
);

tagSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Tag", tagSchema);
