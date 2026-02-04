const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CustomerAccount } = require("../models");
const { blacklistToken } = require("../middleware/authMiddleware");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const login = async (req, res) => {
  const { phone_number, password ,email} = req.body;
  // let normalizedPhoneNumber = phone_number;
  // if (normalizedPhoneNumber.startsWith("0")) {
  //   normalizedPhoneNumber = normalizedPhoneNumber.replace(/^0/, "+251");
  // }

  try {
    const customer = await CustomerAccount.findOne({
      // where: { phone_number: normalizedPhoneNumber },
      where: { email: email },
    });
    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!customer.account_status) {
      return res.status(403).json({ message: "Account is deactivated." });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: customer.customer_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );

  
    return res.status(200).json({ token, customer });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No active session" });
  }

  blacklistToken(token);
  return res.status(204).send();
};

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  try {
    const customer = await CustomerAccount.findOne({ where: { email } });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    customer.resetToken = resetToken;
    customer.resetTokenExpiration = Date.now() + 3600000;
    await customer.save();

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

    const resetLink = `http://1/auth/reset-password?token=${resetToken}`;

   const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: "EPA Account Password Reset Request",
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Hello ${customer.full_name},</p>

      <p>We received a request to reset the password for your EPA account associated with this email address (${email}).</p>

      <p style="text-align: center;">
        <a href="${resetLink}" 
           style="background-color: #007BFF; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>

      <p>This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>

      <p>For your security, we recommend updating your password regularly and keeping it confidential.</p>

      <p>If you need assistance, feel free to contact our support team.</p>

      <p>Best regards,<br/>
      <strong>The EPA Team</strong></p>
    </div>
  `,
};


    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "Password reset link sent to your email" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const customer = await CustomerAccount.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: Date.now() },
      },
    });

    if (!customer) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    customer.password = hashedPassword;
    customer.resetToken = null;
    customer.resetTokenExpiration = null;
    await customer.save();

    return res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  logout,
  resetPasswordRequest,
  resetPassword,
};