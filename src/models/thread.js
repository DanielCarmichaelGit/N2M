const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  thread_id: { type: String, required: true },
  users: { type: Array, required: true },
  owner: { type: Object, required: true },
  password_protected: { type: Boolean, required: true },
  created_date: { type: String, required: true }
});

module.exports = mongoose.model("Thread", threadSchema);
