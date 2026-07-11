import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    organization: { type: String, trim: true },
    credentialId: String,
    credentialUrl: String,
    verificationLink: String,
    issuedAt: Date,
    expiresAt: Date,
    image: { url: String, publicId: String },
    pdfUrl: { type: String, default: "" },
    skillsLearned: [String],
    visible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);
