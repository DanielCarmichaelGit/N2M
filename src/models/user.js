// src/models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  name: {
    type: Object,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  organization: {
    type: Object,
    required: false,
  },
  kpi_data: {
    type: Object,
    required: false,
  },
  tasks: {
    type: Array,
    required: false,
  },
  profile_image_url: {
    type: String,
    required: false,
  },
  sprints: {
    type: Array,
    required: false
  },
  marketable: {
    type: Boolean,
    required: false
  },
  hourly_rate: {
    type: Number,
    required: false
  }
});

module.exports = mongoose.model("User", userSchema);
