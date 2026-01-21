const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "driver"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: { type: String },
  emailVerificationExpiry: { type: Date },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  licenseNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  licenseDocument: {
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  profileImage: {
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  phoneNumber: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  address: String,
  emergencyContact: {
    type: String
  },
  experience: {
    type: Number,
    min: 0,
    max: 50
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active"
  },


  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Index for soft delete queries
DriverSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Driver", DriverSchema);