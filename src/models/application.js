const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  application_id: { type: String, required: true },
  applicant_type: { type: String, required: true },
  applicant_user: { type: Object, required: false },
  quote: { type: Number, required: true },
  intro_message: { type: String, required: false },
  contract_id: { type: String, required: true },
  applicant_portfolio_id: { type: String, required: false },
  applicant_description: { type: String, required: true },
  applicant_work_history: { type: Array, required: true },
  applicant_email: { type: String, required: true },
  applied_date: { type: String, required: false },
  skills: { type: Array, required: false },
  status: { type: Array, required: false }
});

module.exports = mongoose.model("Application", applicationSchema);
