const mongoose = require("mongoose");

const ROLES = ["Viewer", "Analyst", "Admin"];
const STATUSES = ["active", "inactive"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ROLES,
      default: "Viewer",
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "active",
    },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ getters: true, versionKey: false });
  delete obj.password;
  return obj;
};

module.exports = {
  User: mongoose.model("User", userSchema),
  ROLES,
  STATUSES,
};
