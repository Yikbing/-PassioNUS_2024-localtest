//working studybuddy.js

const express = require('express');
const mongoose = require('mongoose');
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
    // Find or create a new entry
    const updatedModuleEntry = await Module.findOneAndUpdate(
      { userId }, // Query to find the document by userId
      { $set: { modules } }, // Update the modules field
      { upsert: true, new: true } // Create a new document if none exists, and return the updated document
    );

    // Find users with similar modules
    const allModules = await Module.find({}).exec();

    let bestMatch = null;
    let highestScore = 0;
    let commonModules = [];

    for (const moduleEntry of allModules) {
      if (moduleEntry.userId !== userId) {
        const { score, common } = calculateSimilarityScore(modules, moduleEntry.modules);

        if (score > highestScore) {
          highestScore = score;
          bestMatch = moduleEntry;
          commonModules = common;
        }
      }
    }

    // If a best match is found, retrieve additional information
    if (bestMatch) {
      const matchedUser = await Config.findOne({ userId: bestMatch.userId }).exec();

      if (matchedUser) {
        console.log(`Matching userId: ${userId}`);
        console.log(`Best match userId: ${bestMatch.userId}`);
        console.log(`Highest Score: ${highestScore}`);
        console.log(`Common modules: ${commonModules.join(', ')}`);

        // Log matched user details
        console.log(`Matched user name: ${matchedUser.name}`);
        console.log(`Matched user faculty: ${matchedUser.faculty}`);
        console.log(`Matched user year of study: ${matchedUser.year}`);

        res.json({
          match: {
            name: matchedUser.name,
            faculty: matchedUser.faculty,
            yearOfStudy: matchedUser.year
          },
          commonModules // Send the common modules
        });
      } else {
        console.log('No match found in config.');
        res.json({ match: null });
      }
    } else {
      console.log('No match found.');
      res.json({ match: null });
    }
  } catch (error) {
    console.error('Error handling studybuddy request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function calculateSimilarityScore(modules1, modules2) {
  // Use a set to remove duplicates and ensure unique module names
  const moduleNames1 = new Set(modules1.map(mod => mod.name));
  const moduleNames2 = new Set(modules2.map(mod => mod.name));
  const common = [];

  let score = 0;
  moduleNames1.forEach(name1 => {
    if (moduleNames2.has(name1)) {
      score++;
      common.push(name1); // Collect the common modules
    }
  });

  return { score, common };
}

module.exports = router;
