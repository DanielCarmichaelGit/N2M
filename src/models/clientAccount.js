const mongoose = require("mongoose");

const clientAccountSchema = new mongoose.Schema({
  account_id: { type: String, required: true },
  status: { type: String, required: true },
  account_name: { type: String, required: true },
  account_email: { type: String, required: true },
  account_password: { type: String, required: true },
  tags: { type: Array, required: true },
  creation_date: { type: String, required: true },
  rating: { type: Number, required: true },
  join_offer: { type: Object, required: false },
  account_description: { type: String, required: false },
});

module.exports = mongoose.model("ClientAccount", clientAccountSchema);
