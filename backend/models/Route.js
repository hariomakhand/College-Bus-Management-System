import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  startPoint: { type: String, required: true },
  endPoint: { type: String, required: true },
  stops: [{ type: String }],
  estimatedTime: { type: String },
  distanceKm: { type: Number },
   buses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bus" }], // Reverse relation
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }] // Optional
}, { timestamps: true });

export default mongoose.model("Route", routeSchema);
