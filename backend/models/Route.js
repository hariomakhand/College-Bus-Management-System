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
    type: String, // comma-separated stops
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