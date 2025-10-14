import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    senderType: { type: String, enum: ["admin", "driver"], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, refPath: "senderType" },
    message: { type: String, required: true },
    bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    date: { type: Date, default: Date.now },

    bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" }, // Optional
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }] // Optional: specific students

}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
