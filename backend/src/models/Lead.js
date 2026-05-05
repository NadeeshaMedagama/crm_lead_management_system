const mongoose = require("mongoose");

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];
const LEAD_SOURCES = ["Website", "LinkedIn", "Referral", "Cold Email", "Event", "Other"];

const leadSchema = new mongoose.Schema(
  {
    leadName: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    leadSource: { type: String, enum: LEAD_SOURCES, required: true },
    assignedSalesperson: { type: String, required: true, trim: true },
    status: { type: String, enum: LEAD_STATUSES, default: "New" },
    estimatedDealValue: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = {
  Lead: mongoose.model("Lead", leadSchema),
  LEAD_STATUSES,
  LEAD_SOURCES,
};
