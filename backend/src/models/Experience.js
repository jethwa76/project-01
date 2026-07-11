import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: [true, "Company name is required."], trim: true },
    position: { type: String, required: [true, "Position is required."], trim: true },
    startDate: { type: Date, required: [true, "Start date is required."] },
    endDate: Date,
    current: { type: Boolean, default: false },
    description: { type: String, maxlength: 2000 },
    technologies: [String],
    achievements: [String],
    images: [{ url: String, publicId: String }],
    location: String,
    type: { type: String, enum: ["full-time", "part-time", "contract", "internship", "freelance"], default: "full-time" },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

experienceSchema.index({ order: 1 });

export default mongoose.model("Experience", experienceSchema);
