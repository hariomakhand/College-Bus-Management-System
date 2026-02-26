const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true
  },
  routeNumber: {
    type: String
  },
  startPoint: {
    type: String,
    required: true
  },
  endPoint: {
    type: String,
    required: true
  },
  stops: {
    type: String, // JSON string: [{"name":"Stop1","time":"08:30"},{"name":"Stop2","time":"08:45"}]
    default: ""
  },
  departureTime: {
    type: String, // Format: "HH:MM" (24-hour)
    default: ""
  },
  arrivalTime: {
    type: String, // Format: "HH:MM" (24-hour)
    default: ""
  },
  distance: {
    type: Number,
    required: true,
    min: 0.1
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  description: String,
  status: {
    type: String,
    enum: ["active", "inactive"],
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
RouteSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Route", RouteSchema);