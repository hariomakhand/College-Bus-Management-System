import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
    busNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    route: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
    status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },

    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },  // Relation to Driver
    route: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },    // Relation to Route
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Reverse relation to students
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],

    // For verification
    isVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String }, // store OTP
    emailVerificationExpiry: { type: Date }, // OTP expiry time

    // forgate password ke liye
    resetPasswordToken: String,
    resetPasswordExpire: Date,

}, { timestamps: true });

export default mongoose.model("Bus", busSchema);
