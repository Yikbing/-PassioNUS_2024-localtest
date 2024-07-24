const mongoose = require('mongoose');

// Define the schema for individual modules
const ModuleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true, // Ensure that userId is provided
  },
  modules: [
    {
      name: {
        type: String,
        required: true, // Ensure that each module has a name
      },
    },
  ],
});

// Create the model using the schema
const Module = mongoose.model('Module', ModuleSchema);

module.exports = Module;
