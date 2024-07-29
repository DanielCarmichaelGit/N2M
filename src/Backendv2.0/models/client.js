const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  client_id: { type: String, required: true },
  client_name: { type: String, required: true },
  client_email: { type: String, required: true },
  
});

module.exports = mongoose.model("Client", clientSchema);
