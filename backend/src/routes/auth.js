const express = require("express");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const User = require("../models/User");
const config = require("../config");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  }
);

module.exports = router;
