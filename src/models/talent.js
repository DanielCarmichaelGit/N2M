const mongoose = require("mongoose");

const talentSchema = new mongoose.Schema({
  talent_id: { type: String, required: true },
  email: { type: String, required: true },
  skills: { type: Array, required: true },
});

module.exports = mongoose.model("Talent", talentSchema);
