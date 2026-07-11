import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    device: {
      type: String,
      default: "Unknown"
    },
    browser: {
      type: String,
      default: "Unknown"
    },
    os: {
      type: String,
      default: "Unknown"
    },
    ip: {
      type: String,
      default: ""
    },
    userAgent: {
      type: String,
      default: ""
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 } // TTL index — MongoDB auto-deletes expired sessions
    }
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
