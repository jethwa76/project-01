import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true
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
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound unique index for tracking unique visitors per IP + UserAgent combination
visitorSchema.index({ ip: 1, userAgent: 1 }, { unique: true });
visitorSchema.index({ createdAt: 1 });

export default mongoose.model("Visitor", visitorSchema);
