const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  project_id: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: Object, required: true },
  client: { type: Object, required: false },
});

module.exports = mongoose.model("Project", projectSchema);
