const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../model/Users");
const { generateOTP, sendOTP } = require("../util/otp");

router.post("/generate-otp", async (req, res) => {
  const email = req.body.email;

  // console.log(email);
  try {
    let user = await User.findOne({ email: email });

    // If user does not exist, create a new user
    if (!user) {
      user = new User({ email: email });
    }

    // If user is blocked, return an error
    if (user.isBlocked) {
      const currentTime = new Date();
      if (currentTime < user.blockUntil) {
        return res.json({
          status: 403,
          message: "Account blocked. Try after some time.",
        });
      } else {
        user.isBlocked = false;
        user.OTPAttempts = 0;
      }
    }

    // Check for minimum 1-minute gap between OTP requests
    const lastOTPTime = user.OTPCreatedTime;
    const currentTime = new Date();

    if (lastOTPTime && currentTime - lastOTPTime < 60000) {
      return res.json({
        status: 403,
        message: "Minimum 1-minute gap required between OTP requests",
      });
    }

    const OTP = generateOTP();
    user.OTP = OTP;
    user.OTPCreatedTime = currentTime;

    await user.save();

    await sendOTP(email, OTP);
    res.json({
      status: 200,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 500,
      message: "Server error",
    });
  }
});

router.post("/verify", async (req, res) => {
  const email = req.body.email;
  const OTP = req.body.OTP;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      res.json({
        status: 404,
        message: "User not found",
      });
      return res.json({
        status: 404,
        message: "User not found",
      });
    }

    // Check if user account is blocked
    if (user.isBlocked) {
      const currentTime = new Date();
      if (currentTime < user.blockUntil) {
        return res.json({
          status: 403,
          message: "Account blocked. Try after some time.",
        });
      } else {
        user.isBlocked = false;
        user.OTPAttempts = 0;
      }
    }

    // Check OTP
    if (user.OTP !== OTP) {
      user.OTPAttempts++;

      // If OTP attempts >= 5, block user for 1 hour
      if (user.OTPAttempts >= 5) {
        user.isBlocked = true;
        let blockUntil = new Date();
        blockUntil.setHours(blockUntil.getHours() + 1);
        user.blockUntil = blockUntil;
      }

      await user.save();

      return res.json({
        status: 403,
        message: "Invalid OTP",
      });
    }

    // Check if OTP is within 3 minutes
    const OTPCreatedTime = user.OTPCreatedTime;
    const currentTime = new Date();

    if (currentTime - OTPCreatedTime > 3 * 60 * 1000) {
      return res.json({
        status: 403,
        message: "OTP expired",
      });
    }

    // Generate JWT
    const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    // Clear OTP
    user.OTP = undefined;
    user.OTPCreatedTime = undefined;
    user.OTPAttempts = 0;
    user.token = token;

    await user.save();
    res.json({ token });
    console.log("User logged in successfully");
  } catch (err) {
    console.log(err);

    res.json({
      status: 500,
      message: "Server error",
    });
  }
});

module.exports = router;
