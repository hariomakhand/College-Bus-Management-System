const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  // For verification
  isVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String }, // store OTP
  emailVerificationExpiry: { type: Date }, // OTP expiry time

  // forgate password ke liye
  resetPasswordToken: String,
  resetPasswordExpire: Date,

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, "signup");
