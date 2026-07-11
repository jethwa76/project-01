import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: [true, "Institution is required."], trim: true },
    degree: { type: String, required: [true, "Degree is required."], trim: true },
    field: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    current: { type: Boolean, default: false },
    cgpa: { type: Number, min: 0, max: 10 },
    semester: Number,
    subjects: [String],
    achievements: [String],
    description: { type: String, maxlength: 1500 },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

educationSchema.index({ order: 1 });

export default mongoose.model("Education", educationSchema);
