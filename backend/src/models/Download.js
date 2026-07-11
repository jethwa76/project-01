import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true },
    resourceType: { type: String, enum: ["resume", "certificate", "project", "other"], required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    downloadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

downloadSchema.index({ resourceType: 1, downloadedAt: -1 });

export default mongoose.model("Download", downloadSchema);
