import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["system", "project", "message", "security"],
      default: "system"
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: String
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
