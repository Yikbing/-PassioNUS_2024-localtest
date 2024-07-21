const router = require("express").Router();
const { studentModel, validate } = require("../models/Student");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const { allUsers } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		let user = await studentModel.findOne({ email: req.body.email });
		if (user) {
			if (!user.verified) {
				return res.status(409).send({ message: "A verification email has already been sent out." });
			} else {
				return res.status(409).send({ message: "User with given email already exists!" });
			}
		}

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		user = await new studentModel({ ...req.body, password: hashPassword }).save();

		const token = await new Token({
			userId: user._id,
			token: crypto.randomBytes(32).toString("hex"),
		}).save();
		const url = `${process.env.BASE_URL}students/${user.id}/verify/${token.token}`;
		await sendEmail(user.email, "Verify Email", url);

		res
			.status(201)
			.send({ message: "An email has been sent to your school email, please verify." });
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});

router.get("/:id/verify/:token/", async (req, res) => {
	try {
		const user = await studentModel.findOne({ _id: req.params.id });
		if (!user) return res.status(400).send({ message: "Invalid link" });

		const token = await Token.findOne({
			userId: user._id,
			token: req.params.token,
		});
		if (!token) return res.status(400).send({ message: "Invalid link" });

		await studentModel.updateOne({_id: user._id},{verified: true});
		await token.deleteOne({ _id: token._id });
		
		if (user.verified) {
		res.status(200).send({ message: "Email has been verified successfully" });
		}
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

// chat feature to search for users
router.route("/").get(protect, allUsers);

module.exports = router;