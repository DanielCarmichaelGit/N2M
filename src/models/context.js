// src/models/context.js
const mongoose = require("mongoose");

const contextSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  associated_org_id: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Context", contextSchema);
