const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  contract_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: { type: Array, required: false },
  budget: { type: Object, required: true },
  status: { type: String, required: true },
  client_account_id: { type: String, required: true },
  client_account_details: { type: Object, required: true },
  project_id: { type: String, required: false },
  created_date: { type: String, required: false },
  timeline: { type: Object, required: true },
  recurring: { type: Boolean, required: true },
  recurring_timeline: { type: Object, required: false },
  application_count: { type: Number, required: true }
});

module.exports = mongoose.model("Contract", contractSchema);
