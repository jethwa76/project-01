import mongoose from "mongoose";

const predefinedAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("PredefinedAdmin", predefinedAdminSchema);
