const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message_id: { type: String, required: true },
  thread_id: { type: String, required: true },
  owner: { type: Object, required: true },
  reference_item: { type: Object, required: false },
  automatic_item: { type: Boolean, required: true },
  created_date: { type: String, required: true }
});

module.exports = mongoose.model("Message", messageSchema);
