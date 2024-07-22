const express = require('express');
const router = express.Router();
const User = require('../models/config'); // Import your User model
const Interest = require('../models/interests'); // Import your Interest model

// Route to handle fetching users with optional filtering
router.post('/', async (req, res) => {
  console.log('Received POST request at /api/matching');
  console.log('Request body:', req.body); // Log request body

  // Access userId and gender from the request body
  const { userId, gender } = req.body; // Get userId and gender from request body

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user ID provided' });
  }

  if (!gender) {
    return res.status(400).json({ error: 'Bad Request: No gender provided' });
  }

  try {
    // Fetch users based on gender filter
    let users;
    if (gender === 'Male' || gender === 'Female') {
      users = await User.find({ gender: gender });
    } else {
      users = await User.find(); // Fetch all users if no gender filter
    }

    // Fetch interests of the matching user
    const matchingUserInterests = await Interest.findOne({ userId: userId });
    if (!matchingUserInterests) {
      return res.status(404).json({ error: 'Matching user interests not found' });
    }

    // Fetch the matching user's year of study
    const matchingUser = await User.findById(userId);
    if (!matchingUser) {
      return res.status(404).json({ error: 'Matching user not found' });
    }
    const matchingUserYear = matchingUser.year;

    // Calculate points based on overlapping interests and add year of study gap
    const userScores = await Promise.all(users.map(async (user) => {
      const userInterests = await Interest.findOne({ userId: user._id });
      if (!userInterests) {
        return { user, score: 0, yearGap: Math.abs(user.year - matchingUserYear) };
      }

      const overlap = userInterests.interests.filter(interest =>
        matchingUserInterests.interests.includes(interest)
      ).length;

      return { user, score: overlap, yearGap: Math.abs(user.year - matchingUserYear) };
    }));

    // Sort users first by score (descending), then by year gap (ascending)
    userScores.sort((a, b) => {
      if (b.score === a.score) {
        return a.yearGap - b.yearGap; // Sort by year gap if scores are the same
      }
      return b.score - a.score; // Sort by score
    });

    // Filter top matches with the same score and year gap
    const highestScore = userScores[0].score;
    const smallestYearGap = userScores[0].yearGap;
    const topMatches = userScores.filter(userScore =>
      userScore.score === highestScore && userScore.yearGap === smallestYearGap
    );

    // Randomly select one user from the top matches
    const bestMatch = topMatches[Math.floor(Math.random() * topMatches.length)].user;

    res.json(bestMatch); // Return the best match user
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

module.exports = router;
