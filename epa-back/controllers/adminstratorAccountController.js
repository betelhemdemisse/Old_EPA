'use strict';

const {
  AdministratorAccounts,
  Role,
  UserHasRole,
  SubPollutionCategory,
  UserHasSubCategory, Branch,
  userHasHierarchy,
  organizationHierarchy,
  RoleHasPermission,
Permission
} = require("../models");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");


const generateRandomPassword = (length = 6) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";
  return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
};

const generateWelcomeEmail = ({ name, password }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <h2 style="color: #2E86C1;">Welcome, ${name}!</h2>
    <p>Your temporary password is:</p>
    <p style="font-size: 1.2em; font-weight: bold;">${password}</p>
    <p>Please change your password after your first login.</p>
  </div>
`;

// ------------------------
// CREATE ADMINISTRATOR
// ------------------------
const createAdministratorUser = async (req, res) => {
  try {
    const {
      name, email, role_ids,
      phone, gender,
      sub_pollution_category_id, hierarchy_ids,
       isRegional

    } = req.body;
    const existingUser = await AdministratorAccounts.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User with this email already exists." });
    const created_by = req.user.id
    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 6);

    const newUser = await AdministratorAccounts.create({
      user_id: uuidv4(),
      name,
      email,
      phone,
      isRegional,
      gender,
      password: hashedPassword,
      created_by,
      updated_by: created_by,
      created_at: new Date(),
      updated_at: new Date()
    });

    if (Array.isArray(role_ids) && role_ids.length > 0) {
      const roles = await Role.findAll({ where: { role_id: role_ids } });
      if (roles.length !== role_ids.length) return res.status(400).json({ message: "Invalid role IDs." });

      await Promise.all(roles.map(role =>
        UserHasRole.create({
          user_role_id: uuidv4(),
          user_id: newUser.user_id,
          role_id: role.role_id
        })
      ));
    }

    if (Array.isArray(sub_pollution_category_id) && sub_pollution_category_id.length > 0) {
      const subCats = await SubPollutionCategory.findAll({ where: { sub_pollution_category_id } });
      if (subCats.length !== sub_pollution_category_id.length) return res.status(400).json({ message: "Invalid sub-pollution category IDs." });

      await Promise.all(subCats.map(subCat =>
        UserHasSubCategory.create({
          user_has_sub_pullution_category_id: uuidv4(),
          user_id: newUser.user_id,
          sub_pollution_category_id: subCat.sub_pollution_category_id
        })
      ));
    }

    if (Array.isArray(hierarchy_ids) && hierarchy_ids.length > 0) {
      const hierarchies = await organizationHierarchy.findAll({ where: { organization_hierarchy_id: hierarchy_ids } });
      if (hierarchies.length !== hierarchy_ids.length) return res.status(400).json({ message: "Invalid hierarchy IDs." });

      await Promise.all(hierarchies.map(h =>
        userHasHierarchy.create({
          userHasHierarchy_id: uuidv4(),
          user_id: newUser.user_id,
          organization_hierarchy_id: h.organization_hierarchy_id
        })
      ));
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"EPA Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your EPA Account Password",
      html: generateWelcomeEmail({ name, password })
    });

    const userWithDetails = await AdministratorAccounts.findOne({
      where: { user_id: newUser.user_id },
      include: [
        { model: Role, as: "roles", attributes: ["role_id", "name"] },
        {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [{ model: organizationHierarchy, as: "hierarchy" }]
        }
      ]
    });

    res.status(201).json(userWithDetails);

  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getAllAdministrators = async (req, res) => {
  try {
    const users = await AdministratorAccounts.findAll({
      where:{isRegional:false},
      include: [
        { model: Role, as: "roles", attributes: ["role_id", "name"] },
        {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [{ model: organizationHierarchy, as: "hierarchy" }]
        }
      ]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching administrators:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const getAllUser = async (req, res) => {
  try {
    const users = await AdministratorAccounts.findAll({
      include: [
       {
          model: Role,
          as: "roles",
          required: true,
          duplicating: false,
          include: [
            {
              model: RoleHasPermission,
              as: "roleHasPermissions",
              required: true,
             include: [
        {
          model: Permission,
          as: "permission",
          required: true,
          where: {
            resource: "expert",
            action: "can-get-case",
          },
        },
      ],
            },
          ],
        },
        {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [{ model: organizationHierarchy, as: "hierarchy" }]
        }
      ]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching administrators:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getAllRegionalUser = async (req, res) => {
  try {
    const users = await AdministratorAccounts.findAll({
      where: { isRegional: true },
      include: [
        { model: Role, as: "roles", attributes: ["role_id", "name"] },
        {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [{ model: organizationHierarchy, as: "hierarchy" }]
        }
      ]
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching regional users:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


const getAdministratorById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AdministratorAccounts.findOne({
      where: { user_id: id },
      include: [
        { model: Role, as: "roles", attributes: ["role_id", "name"] },
        {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [{ model: organizationHierarchy, as: "hierarchy" }]
        }
      ]
    });
    if (!user) return res.status(404).json({ message: "Administrator not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching administrator:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const updateAdministrator = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email,  role_ids,
      phone, gender,
      sub_pollution_category_id, hierarchy_ids,
      updated_by
    } = req.body;

    const user = await AdministratorAccounts.findByPk(id);
    if (!user) return res.status(404).json({ message: "Administrator not found" });
const subCategoryIds = Array.isArray(sub_pollution_category_id)
  ? sub_pollution_category_id
  : sub_pollution_category_id
  ? [sub_pollution_category_id]
  : [];

// choose ONE primary (or null)
const primarySubCategory = subCategoryIds[0] || null;

    await user.update({
  name,
  email,
  phone,
  gender,
  sub_pollution_category_id: primarySubCategory,
  updated_by,
  updated_at: new Date(),
});

    if (Array.isArray(role_ids)) {
      await UserHasRole.destroy({ where: { user_id: id } });
      const roles = await Role.findAll({ where: { role_id: role_ids } });
      await Promise.all(roles.map(role =>
        UserHasRole.create({ user_role_id: uuidv4(), user_id: id, role_id: role.role_id })
      ));
    }

    if (Array.isArray(sub_pollution_category_id)) {
      await UserHasSubCategory.destroy({ where: { user_id: id } });
      const subCats = await SubPollutionCategory.findAll({ where: { sub_pollution_category_id } });
      await Promise.all(subCats.map(subCat =>
        UserHasSubCategory.create({
          user_has_sub_pullution_category_id: uuidv4(),
          user_id: id,
          sub_pollution_category_id: subCat.sub_pollution_category_id
        })
      ));
    }

    if (Array.isArray(hierarchy_ids)) {
      await userHasHierarchy.destroy({ where: { user_id: id } });
      const hierarchies = await organizationHierarchy.findAll({ where: { organization_hierarchy_id: hierarchy_ids } });
      await Promise.all(hierarchies.map(h =>
        userHasHierarchy.create({
          userHasHierarchy_id: uuidv4(),
          user_id: id,
          organization_hierarchy_id: h.organization_hierarchy_id
        })
      ));
    }

    const updatedUser = await AdministratorAccounts.findOne({
      where: { user_id: id },
      include: [
        { model: Role, as: "roles", attributes: ["role_id", "name"] },
        {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [{ model: organizationHierarchy, as: "hierarchy" }]
        }
      ]
    });

    res.status(200).json(updatedUser);

  } catch (error) {
    console.error("Error updating administrator:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deleteAdministrator = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AdministratorAccounts.findByPk(id);
    if (!user) return res.status(404).json({ message: "Administrator not found" });

    await UserHasRole.destroy({ where: { user_id: id } });
    await UserHasSubCategory.destroy({ where: { user_id: id } });
    await userHasHierarchy.destroy({ where: { user_id: id } });

    await user.destroy();
    res.status(200).json({ message: "Administrator deleted successfully" });
  } catch (error) {
    console.error("Error deleting administrator:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const activateUserAccount = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await AdministratorAccounts.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === true) {
      return res.status(400).json({ message: "User already active" });
    }

    await user.update({ status: true });

    return res.status(200).json({
      message: "User activated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const deactivateUserAccount = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await AdministratorAccounts.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === false) {
      return res.status(400).json({ message: "User already inactive" });
    }

    await user.update({ status: false });

    return res.status(200).json({
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  activateUserAccount,
  deactivateUserAccount,
  createAdministratorUser,
  getAllAdministrators,
  getAdministratorById,
  updateAdministrator,
  deleteAdministrator,
  getAllRegionalUser,
  getAllUser
};
