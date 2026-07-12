import mongoose from "mongoose";

const verificationDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    documentType: {
      type: String,
      enum: ["Student ID", "College ID", "Government ID", "Resume", "Certificate"],
      required: true
    },
    file: {
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "changes_requested"],
      default: "pending",
      index: true
    },
    remarks: {
      type: String,
      default: ""
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("VerificationDocument", verificationDocumentSchema);
