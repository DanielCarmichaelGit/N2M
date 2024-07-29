const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  skill_id: { type: String, required: true },
  skill_industry: { type: String, required: false },
  skill_keywords: { type: Array, required: false },
  skill_title: { type: String, required: true }
});

module.exports = mongoose.model("Skill", skillSchema);
