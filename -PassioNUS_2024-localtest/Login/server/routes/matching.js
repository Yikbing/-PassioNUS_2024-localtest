const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const collection = require('../models/config'); // Import your User model
const Interest = require('../models/interests'); // Import your Interest model
const { studentModel: Student } = require('../models/Student'); 

router.post('/', async (req, res) => {
  console.log('Received POST request at /api/matching');
  console.log('Request body:', req.body); // Log request body

  const { userId, gender } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user ID provided' });
  }

  if (!gender) {
    return res.status(400).json({ error: 'Bad Request: No gender provided' });
  }

  try {
    // Convert userId to ObjectId
    const userObjectId = userId;
    console.log('Converted userId to ObjectId:', userObjectId);

    // Fetch users based on gender, excluding the user making the request
    let users;
    if (gender === 'Male' || gender === 'Female') {
      users = await collection.find({ gender: gender, userId: { $ne: userObjectId } });
    } else {
      users = await collection.find({ userId: { $ne: userObjectId } });
    }

    console.log('Users found:', users);

    // Find matching user interests
    const matchingUserInterests = await Interest.findOne({ userId: userObjectId });
    console.log('Matching user interests:', matchingUserInterests);
    if (!matchingUserInterests) {
      return res.status(404).json({ error: 'Matching user interests not found' });
    }

    // Find matching user profile using findOne with userId
    const matchingUser = await collection.findOne({ userId: userObjectId });
    console.log('Matching user profile:', matchingUser);
    if (!matchingUser) {
      return res.status(404).json({ error: 'Matching user not found' });
    }

    const matchingUserYear = matchingUser.year;

    // Calculate scores for users
    const userScores = await Promise.all(users.map(async (user) => {
      const userInterests = await Interest.findOne({ userId: user.userId });
      console.log(`User interests for userId ${user.userId}:`, userInterests);

      if (!userInterests) {
        return { user, score: 0, yearGap: Math.abs(user.year - matchingUserYear) };
      }

      const interestKeys = Object.keys(matchingUserInterests._doc).filter(key => key !== '_id' && key !== 'userId' && key !== '__v');
      const overlap = interestKeys.reduce((score, key) => {
        return score + (matchingUserInterests[key] && userInterests[key] ? 1 : 0);
      }, 0);

      const overlappingInterests = interestKeys.filter(key => matchingUserInterests[key] && userInterests[key]);

      return { user, score: overlap, yearGap: Math.abs(user.year - matchingUserYear), overlappingInterests };
    }));

    console.log('User scores:', userScores);
    console.log('Student model:', Student);


    // Sort users based on score and year gap
    userScores.sort((a, b) => {
      if (b.score === a.score) {
        return a.yearGap - b.yearGap;
      }
      return b.score - a.score;
    });

    const highestScore = userScores[0].score;
    const smallestYearGap = userScores[0].yearGap;
    const topMatches = userScores.filter(userScore =>
      userScore.score === highestScore && userScore.yearGap === smallestYearGap
    );

    const bestMatch = topMatches[Math.floor(Math.random() * topMatches.length)];

    // Fetch the email from the Student model
const bestMatchStudent = await Student.findOne({ _id: bestMatch.user.userId });
    if (!bestMatchStudent) {
      return res.status(404).json({ error: 'Best match student not found' });
    }
if (!bestMatchStudent) {
  return res.status(404).json({ error: 'Best match student not found' });
}


    // Include only name, faculty, year, and overlapping interests in the response
    const bestMatchWithInterests = {
      name: bestMatch.user.name,
      faculty: bestMatch.user.faculty,
      year: bestMatch.user.year,
      interests: bestMatch.overlappingInterests,
      email: bestMatchStudent.email // Add email to the response
    };

    res.json(bestMatchWithInterests);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

module.exports = router;
