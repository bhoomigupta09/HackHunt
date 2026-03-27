const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    mode: {
      type: String,
      enum: ["online", "hybrid", "in-person"],
      default: "online"
    },
    prize: { type: String, default: "" },
    maxParticipants: { type: Number, default: 100 },
    imageUrl: { type: String, default: "" },
    tags: { type: [String], default: [] },
    registrationUrl: { type: String, default: "" },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizers",
      required: true
    },
    organizerName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null
    },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" }
  },
  { timestamps: true }
);

const hackathonRegistrationSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hackathons",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    teamName: { type: String, default: "" },
    teamMembers: { type: Number, default: 1, min: 1 },
    status: {
      type: String,
      enum: ["registered", "in_progress", "completed", "cancelled"],
      default: "registered"
    }
  },
  { timestamps: true }
);

hackathonRegistrationSchema.index({ hackathonId: 1, userId: 1 }, { unique: true });

const Hackathon =
  mongoose.models.hackathons || mongoose.model("hackathons", hackathonSchema);
const HackathonRegistration =
  mongoose.models.hackathon_registrations ||
  mongoose.model("hackathon_registrations", hackathonRegistrationSchema);

module.exports = {
  Hackathon,
  HackathonRegistration
};
