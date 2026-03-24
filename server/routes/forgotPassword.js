const express = require("express");
const bcrypt = require("bcryptjs");
const { User, Organizer, Admin } = require("../database/user");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

async function findAccountByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  return (
    (await User.findOne({ email: normalizedEmail })) ||
    (await Organizer.findOne({ email: normalizedEmail })) ||
    (await Admin.findOne({ email: normalizedEmail }))
  );
}

router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findAccountByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User is email se register nahi hai!"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `Your reset password OTP is: ${otp}. It expires in 10 minutes.`;
    const emailResult = await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message
    });

    if (emailResult?.skipped) {
      return res.status(200).json({
        message:
          "OTP generated. Email is not configured on this local server, so OTP was returned for testing.",
        otp
      });
    }

    return res.status(200).json({
      message: "Email bhej diya gaya hai!"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Kuch gadbad ho gayi, firse try karo."
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await findAccountByEmail(email);

    if (!user || user.resetPasswordOTP !== otp || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP galat hai ya expire ho gaya hai!"
      });
    }

    return res.status(200).json({
      message: "OTP sahi hai! Password reset kar sakte ho."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Kuch gadbad ho gayi."
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await findAccountByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User nahi mila!"
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      message: "Password successfully change ho gaya!"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Kuch gadbad ho gayi."
    });
  }
});

module.exports = router;
