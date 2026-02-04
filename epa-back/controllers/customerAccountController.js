const { CustomerAccount } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const twilio = require("twilio");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const path = require("path");
require("dotenv").config();
const { sendSMS } = require("../utils/sms");
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) throw new Error("Phone number is required");

  const phone = phoneNumber.replace(/[\s()-]/g, "");

  if (phone.startsWith("0") && phone.length === 10) {
    return "+251" + phone.slice(1);
  }

  if (phone.startsWith("251") && phone.length === 12) {
    return "+" + phone;
  }

  if (phone.startsWith("+251") && phone.length === 13) {
    return phone;
  }

  throw new Error(
    "Invalid phone number format. Use 09XXXXXXXX, 2519XXXXXXXX, or +2519XXXXXXXX"
  );
};

module.exports = { formatPhoneNumber };

const sendEmail = async (email, subject, text) => {
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

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email. ${error}`);
  }
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const createCustomerAccount = async (req, res) => {
  try {
    const { full_name, email, phone_number, password } = req.body;

    let normalizedPhone;
    try {
      normalizedPhone = formatPhoneNumber(phone_number);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    if (email) {
      const existingEmailCustomer = await CustomerAccount.findOne({
        where: { email },
      });
      if (existingEmailCustomer) {
        return res
          .status(400)
          .json({ message: "Customer with this email already exists." });
      }
    }

    const existingPhoneCustomer = await CustomerAccount.findOne({
      where: { phone_number: normalizedPhone },
    });
    if (existingPhoneCustomer) {
      return res
        .status(400)
        .json({ message: "Customer with this phone number already exists." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer_id = uuidv4();

    await CustomerAccount.create({
      email: email || null,
      customer_id,
      full_name,
      phone_number: normalizedPhone,
      password: hashedPassword,
      account_status: false,
      otp,
      otp_expiry: otpExpiry,
    });

    const smsMessage = `Dear Customer, your OTP for EPA account verification is ${otp}. This OTP is valid for 10 minutes.`;
    const emailMessage = `
Dear Customer,

Your One-Time Password (OTP) is:

OTP: ${otp}

This OTP is valid for 10 minutes.

EPA Team
`;
console.log("normalizedPhone",normalizedPhone)
    let smsSent = false;
    let emailSent = false;

    try {
      await sendSMS(normalizedPhone, smsMessage);
      smsSent = true;
    } catch (smsErr) {
      console.error("SMS failed:", smsErr.message);
    }

    if (!smsSent && email) {
      try {
        await sendEmail(email, "EPA Account Verification OTP", emailMessage);
        emailSent = true;
      } catch (emailErr) {
        console.error("Email failed:", emailErr.message);
      }
    }

    if (!smsSent && !emailSent) {
      return res.status(500).json({
        message:
          "Failed to send OTP via SMS and Email. Please try again later.",
      });
    }

    res.status(201).json({
      message: smsSent
        ? "Account created successfully. OTP sent via SMS."
        : "Account created successfully. OTP sent via Email.",
    });
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        message: "Error",
        details: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const customer = await CustomerAccount.findOne({ where: { email } });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    if (customer.otp === otp && new Date() < new Date(customer.otp_expiry)) {
      customer.account_status = true;
      customer.otp = null;
      customer.otp_expiry = null;
      await customer.save();
      const token = jwt.sign(
        { id: customer.customer_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION_TIME }
      );

      return res.status(200).json({
        token,
        message: "Customer account activated successfully.",
      });
    } else {
      res.status(400).json({ message: "Invalid OTP or OTP expired." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: error.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const customer = await CustomerAccount.findOne({ where: { email } });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    customer.otp = otp;
    customer.otp_expiry = otpExpiry;
    await customer.save();

    await sendEmail(
      email,
      "Your OTP for Account Verification",
      `Your OTP is: ${otp}\n\nPlease use this OTP within 10 minutes to verify your account.`
    );

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resending OTP", error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password, full_name } =
      req.body || {};

    const customer_id = req.params.customer_id;
    const updateFields = {};

    if (full_name) {
      updateFields.full_name = full_name;
    }

    if (new_password) {
      if (new_password !== confirm_password) {
        return res.status(400).json({
          message: "New password and confirmation password do not match.",
        });
      }

      const customer = await CustomerAccount.findByPk(customer_id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found." });
      }

      const isMatch = await bcrypt.compare(current_password, customer.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Current password is incorrect.",
        });
      }

      updateFields.password = await bcrypt.hash(new_password, 10);
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        message: "No valid fields to update.",
      });
    }

    const [updated] = await CustomerAccount.update(updateFields, {
      where: { customer_id },
    });

    if (!updated) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const updatedCustomer = await CustomerAccount.findByPk(customer_id);
    return res.status(200).json(updatedCustomer);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await CustomerAccount.findAll();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await CustomerAccount.findByPk(req.params.id);
    if (customer) {
      res.status(200).json(customer);
    } else {
      res.status(404).json({ message: "Customer not found." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const deleted = await CustomerAccount.destroy({
      where: { customer_id: req.params.id },
    });
    if (deleted) {
      res
        .status(200)
        .json({ message: "Customer account deleted successfully." });
    } else {
      res.status(404).json({ message: "Customer not found." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error deleting customer account",
      error: error.message,
    });
  }
};
const activateUserAccount = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const user = await CustomerAccount.findByPk(customer_id);

    if (!user) {
      return res.status(404).json({ message: "customer not found" });
    }

    if (user.status === true) {
      return res.status(400).json({ message: "customer already active" });
    }

    await user.update({ account_status: true });

    return res.status(200).json({
      message: "customer activated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const deactivateUserAccount = async (req, res) => {
  try {
    const { customer_id } = req.params;
    console.log("customer_idcustomer_id", customer_id);
    const user = await CustomerAccount.findByPk(customer_id);

    if (!user) {
      return res.status(404).json({ message: "customer not found" });
    }

    if (user.status === false) {
      return res.status(400).json({ message: "customer already inactive" });
    }

    await user.update({ account_status: false });

    return res.status(200).json({
      message: "customer deactivated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  createCustomerAccount,
  verifyOTP,
  resendOTP,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
  deactivateUserAccount,
  activateUserAccount,
};
