import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: String,
    position: String,
    company: String,
    quote: { type: String, required: true, maxlength: 600 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    avatar: { url: String, publicId: String },
    approved: { type: Boolean, default: false },
    visible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);
