const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  applicationNumber: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
   role: { type: String, default: "student" },
  phone: { type: String },
  department: { type: String },
  pickupLocation: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  isApproved: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  rejectionReason: { type: String },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
  route: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
  isVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpiry: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
