const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  portfolio_id: { type: String, required: true },
  user_type: { type: String, required: true },
  account_email: { type: String, required: true },
  user_id: { type: String, required: true },
  tags: { type: Array, required: true },
  portfolio_title: { type: String, required: true },
  portfolio_description: { type: String, required: true }
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
