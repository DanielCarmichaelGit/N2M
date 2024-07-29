const mongoose = require("mongoose");

const marketableFreelancerSchema = new mongoose.Schema({
  freelancer_email: { type: String, required: true },
  status: { type: String, required: true },
  converted: { type: Boolean, required: true },
  opted_in: { type: Boolean, required: true }
});

module.exports = mongoose.model("MarketableFreelancer", marketableFreelancerSchema);
