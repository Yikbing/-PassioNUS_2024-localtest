const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { accessChat, fetchChats } = require("../controllers/chatController");

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);

module.exports = router;