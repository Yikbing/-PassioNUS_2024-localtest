const express = require('express');
const mongoose = require('mongoose');
const Module = require('../models/modules'); // Adjust the path if necessary
const { studentModel: Student } = require('../models/Student');

const router = express.Router();

// Function to remove duplicate modules by name
function removeDuplicateModules(modules) {
  const uniqueModules = [];
  const moduleNames = new Set();

  modules.forEach(mod => {
    if (!moduleNames.has(mod.name)) {
      moduleNames.add(mod.name);
      uniqueModules.push(mod);
    }
  });

  return uniqueModules;
}

// Route to handle module data submission
router.post('/', async (req, res) => {
  let { userId, modules } = req.body;
  console.log('Received data from client:', { userId, modules });

  // Remove duplicates from the modules array
  modules = removeDuplicateModules(modules);

  try {
    // Find or create a new entry in Module
    const updatedModuleEntry = await Module.findOneAndUpdate(
      { userId }, // Query to find the document by userId
      { $set: { modules } }, // Update the modules field
      { upsert: true, new: true } // Create a new document if none exists, and return the updated document
    );

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Update the corresponding Student document
    await Student.updateOne(
      { _id: userObjectId }, // Query to find the student by _id
      { $set: { setup_modules: true } } // Set setup_modules to true
    );

    // Send a success response
    res.status(200).json({ message: 'Modules saved and setup_modules updated successfully.' });
  } catch (error) {
    console.error('Error handling module request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
