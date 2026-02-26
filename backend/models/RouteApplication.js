const mongoose = require("mongoose");

const RouteApplicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
  pickupStop: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    estimatedTime: { type: String }, // Calculated time
    isNewStop: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String },
  adminResponse: { type: String },
  applicationDate: { type: Date, default: Date.now },
  responseDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("RouteApplication", RouteApplicationSchema);
