const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    default: null
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    default: null
  },
  status: {
    type: String,
    enum: ["active", "maintenance", "inactive"],
    default: "active"
  },
  model: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  manufacturingYear: {
    type: Number,
    min: 2000,
    max: new Date().getFullYear()
  },
  lastMaintenance: Date,

  // Location tracking fields
  currentLocation: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 }
  },
  lastLocationUpdate: Date,
  tripStatus: {
    type: String,
    enum: ["idle", "active", "ended"],
    default: "idle"
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
BusSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Bus", BusSchema);