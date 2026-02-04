const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AdministratorAccounts,userHasHierarchy,organizationHierarchy, Role, Permission } = require("../models");
const { blacklistToken } = require("../middleware/authMiddleware");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
// const logActivity = require("../utils/logActivity");

const login = async (req, res) => {
  const { email, password } = req.body;
console.log("req.body",req.body);
  try {
    const user = await AdministratorAccounts.findOne({
      where: { email: email },
      include: [
        {
          model: Role,
          as: "roles",
          include: [
            {
              model: Permission,
              as: "permissions",
            },
          ],
        },
         {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [
            {
              model: organizationHierarchy,
              as: "hierarchy",
            },
          ],
        },
      ],
    });
const organizationHierarchyId =
  user?.hierarchies?.length > 0
    ? user.hierarchies[0].organization_hierarchy_id
    : null;

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const permissions =
      user.roles?.flatMap(role =>
        role.permissions?.map(p => `${p.resource}:${p.action}`)
      ) || [];
    const uniquePermissions = [...new Set(permissions)];

    const role_ids = user.roles?.map(role => role.id) || [];

    const tokenPayload = {
      id: user.user_id,
      roles: role_ids,
      permissions: uniquePermissions,
      organization_hierarchy_id:organizationHierarchyId
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || "3h",
    });
    const userResponse = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      username: user.username,
      gender: user.gender,
      roles: user.roles || [],
      permissions: uniquePermissions || [],
      isRegional: user.isRegional,
    };

    return res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPermissionsByAdministratorAccountsId = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await AdministratorAccounts.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Role,
          as: "roles",
          include: [
            {
              model: Permission,
              as: "permissions",
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Administrator Accounts not found" });
    }

    const permissions = user.roles.reduce((result, role) => {
      return result.concat(role.permissions);
    }, []);

    const permissionNames = permissions.map((p) => p);

    return res.status(200).json({ permissions: permissionNames });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching permissions: ${error.message}` });
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
    const user = await AdministratorAccounts.findOne({ where: { email } });
    console.log("usersssss",user);
    if (!user) {
      return res.status(404).json({ message: "Administrator Accounts not found" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

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

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request for Your EPA Account",
      text:
        `Dear ${user.name},\n\n` +
        `We received a request to reset the password for your EPA account associated with the email address ${email}.\n\n` +
        `To reset your password, please click the link below or copy and paste it into your browser:\n\n` +
        `${resetLink}\n\n` +
        `Please note that this link is valid for only 1 hour. If you did not request a password reset, please ignore this message—your account will remain secure.\n\n` +
        `For your protection, we encourage you to use strong, unique passwords and update them regularly.\n\n` +
        `If you need help or have any questions, our support team is here to assist you at any time.\n\n` +
        `Best regards,\n` +
        `EPA Support Team`,
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
    const user = await AdministratorAccounts.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: Date.now() },
      },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    return res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await AdministratorAccounts.findByPk(req.user.id, {
      attributes: [
        "user_id",
        "name",
        "email",
        "username",
        "gender",
        "phone",
        "isRegional",
        "created_at",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["name"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD FOR LOGGED-IN USER
const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Find user
    const user = await AdministratorAccounts.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  login,
  getPermissionsByAdministratorAccountsId,
  logout,
  resetPasswordRequest,
  resetPassword,
  getCurrentUser,
  changePassword,
};