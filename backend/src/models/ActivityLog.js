import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true
    },
    ip: {
      type: String,
      default: ""
    },
    userAgent: {
      type: String,
      default: ""
    },
    browser: {
      type: String,
      default: "Unknown"
    },
    os: {
      type: String,
      default: "Unknown"
    },
    device: {
      type: String,
      default: "Desktop"
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false }
  }
);

activityLogSchema.index({ timestamp: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
