const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  applicationNumber: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" },
  phone: { type: String },
  department: { type: String },
  year: { type: String },
  pickupLocation: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  isApproved: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  rejectionReason: { type: String },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
  route: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
  // Bus application fields
  busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
  busRegistrationStatus: { 
    type: String, 
    enum: ['not_registered', 'pending', 'approved', 'rejected'], 
    default: 'not_registered' 
  },
  appliedRouteId: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
  preferredPickupStop: { type: String },
  applicationReason: { type: String },
  applicationDate: { type: Date },
  approvalDate: { type: Date },
  rejectionDate: { type: Date },
  // Additional contact info
  address: { type: String },
  emergencyContact: { type: String },
  isVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpiry: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  studentId: { type: String, unique: true, sparse: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

// Index for soft delete queries
studentSchema.index({ isDeleted: 1 });

// Pre-save middleware to generate student ID
studentSchema.pre('save', function(next) {
  if (this.isNew && !this.studentId) {
    this.studentId = 'STU' + Date.now();
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);
