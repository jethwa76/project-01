import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    level: { type: Number, min: 0, max: 100, default: 80 },
    icon: String,
    color: String,
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    yearsOfExperience: { type: Number, min: 0, default: 0 },
    certificateUrl: String
  },
  { timestamps: true }
);

export default mongoose.model("Skill", skillSchema);
