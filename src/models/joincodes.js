const mongoose = require("mongoose");

const joinCodeSchema = new mongoose.Schema({
  code_id: { type: String, required: true },
  code: { type: String, required: true },
  account_type: { type: String, required: true },
  account_id: { type: String, required: true },
  discount_type: { type: String, required: true },
  discount_duration: { type: String, required: true },
  created_on: { type: String, required: true },
  uses: { type: Number, required: true }
});

module.exports = mongoose.model("JoinCode", joinCodeSchema);
