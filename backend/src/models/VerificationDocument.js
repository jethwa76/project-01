import mongoose from "mongoose";

const verificationDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["student_id", "college_id", "govt_id", "resume", "certificate", "other"],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "needs_changes"],
      default: "pending"
    },
    adminRemarks: {
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
