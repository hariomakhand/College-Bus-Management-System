const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  phone: { type: String },
  department: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  
  // Verification fields
  isVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpiry: { type: Date },
  
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);