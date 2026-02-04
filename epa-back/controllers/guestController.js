// controllers/guestAuth.controller.js
const { GuestOTP, CustomerAccount ,sequelize} = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
exports.requestGuestOtp = async (req, res) => {
  try {
    const { email, isGuest } = req.body;

    if (!isGuest || !email) {
      return res
        .status(400)
        .json({ message: "Email is required and must be guest" });
    }

    // Check if email exists in the system
    const existingUser = await CustomerAccount.findOne({ where: { email } });

    // Block only real registered users
    if (existingUser && existingUser.is_guest === false) {
      return res.status(409).json({
        message: "This email is already registered. Please login instead.",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP record
    await GuestOTP.create({
      phone_number: email,
      otp_hash: otpHash,
      expires_at: expiresAt,
      verified: false,
      attempts: 0,
    });

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "EPA Guest Report OTP",
      html: `
        <p>Your OTP for submitting a guest report:</p>
        <h2>${otp}</h2>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("OTP request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyGuestOtp = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      await transaction.rollback();
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find the most recent unverified OTP
    const record = await GuestOTP.findOne({
      where: { phone_number: email, verified: false },
      order: [["created_at", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!record) {
      await transaction.rollback();
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (record.expires_at < new Date()) {
      await record.destroy({ transaction });
      await transaction.commit();
      return res.status(400).json({ message: "OTP expired" });
    }
    
    const isValid = await bcrypt.compare(otp, record.otp_hash);

    if (!isValid) {
      record.attempts += 1;
      await record.save({ transaction });
      await transaction.commit();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    let customer = await CustomerAccount.findOne({
      where: { email },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!customer) {
      customer = await CustomerAccount.create(
        {
          customer_id: uuidv4(),
          email,
          is_guest: true,
          account_status: true,
          full_name: "Guest User",
          password: null,
        },
        { transaction }
      );
    }

    await record.destroy({ transaction });

    await transaction.commit();

    const token = jwt.sign(
      {
        customer_id: customer.customer_id,
        email: customer.email,
        is_guest: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("OTP verify error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

