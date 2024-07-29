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
    required: true
  },
  profile_image_url: {
    type: String,
    required: false,
  },
  marketable: {
    type: Boolean,
    required: true
  },
  hourly_rate: {
    type: Number,
    required: false
  },
  marketing_source: {
    type: String,
    required: true
  },
  referral_code: {
    type: String,
    required: false
  },
  referred_by: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model("User", userSchema);
