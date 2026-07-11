import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ["visitor", "editor", "admin"],
      default: "visitor"
    },

    // Profile fields
    headline: String,
    bio: String,
    location: String,
    website: String,
    avatar: {
      url: String,
      publicId: String
    },

    // Social / interactions
    savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    favoriteProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],

    // OAuth
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local"
    },
    providerId: String,

    // Email verification
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // Password management
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // Two-Factor Authentication
    twoFactorSecret: { type: String, select: false },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },

    // Refresh token (hashed)
    refreshToken: { type: String, select: false },

    // Remember me preference
    rememberMe: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for OAuth lookups
userSchema.index({ provider: 1, providerId: 1 });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre("save", function setPasswordChangedAt(next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(jwtTimestamp) {
  if (!this.passwordChangedAt) return false;
  return parseInt(this.passwordChangedAt.getTime() / 1000, 10) > jwtTimestamp;
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function createEmailVerificationToken() {
  const verifyToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verifyToken;
};

export default mongoose.model("User", userSchema);
