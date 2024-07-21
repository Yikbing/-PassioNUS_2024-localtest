const asyncHandler = require("express-async-handler");
const { studentModel } = require("../models/Student");

//@description     Get or Search all users
//@route           GET /api/students?search=
//@access          Public

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
  
    const users = await studentModel.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

module.exports = { allUsers };