const {
  Case,
  Complaint,
  TeamCase,
  AdministratorAccounts,
  UserHasRole,
  RoleHasPermission,
  Permission,
  sequelize,
  ActivityLog
} = require("../models");
const { v4: uuidv4 } = require("uuid");

const { Op } = require("sequelize");
const { addDays, differenceInDays, formatDistanceStrict } = require("date-fns");

exports.createRegionalTeam = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      case_id,
      users = [],
      formed_by,
      handling_unit
    } = req.body;

    const currentUser = req.user?.id;
    if (!currentUser) {
      await transaction.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    /* ------------------ Case ------------------ */
    const caseRecord = await Case.findOne({
      where: { case_id },
      transaction
    });

    if (!caseRecord) {
      await transaction.rollback();
      return res.status(404).json({ message: "Case not found" });
    }

    const complaint_id = caseRecord.complaint_id;

    /* ------------------ Complaint ------------------ */
    const complaint = await Complaint.findOne({
      where: { complaint_id },
      transaction
    });

    if (!complaint) {
      await transaction.rollback();
      return res.status(404).json({ message: "Complaint not found" });
    }

    let investigation_days = parseInt(
      complaint.sub_pollution_category?.investigation_days,
      10
    );

    if (isNaN(investigation_days) || investigation_days <= 0) {
      investigation_days = 14;
    }

    /* ------------------ Handling Unit ------------------ */
    const validUnits = ["temporary_team", "regional_team", "hq_expert"];
    if (!validUnits.includes(handling_unit)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid handling_unit" });
    }

    /* ------------------ Role & Permission ------------------ */
    const userRole = await UserHasRole.findOne({
      where: { user_id: currentUser },
      transaction
    });

    if (!userRole) {
      await transaction.rollback();
      return res.status(403).json({ message: "No role assigned" });
    }

    const rolePermissions = await RoleHasPermission.findAll({
      where: { role_id: userRole.role_id },
      transaction
    });

    const permissionIds = rolePermissions.map(p => p.permission_id);

    const allowed = await Permission.findOne({
      where: {
        permission_id: { [Op.in]: permissionIds },
        resource: "teamCase",
        action: "create"
      },
      transaction
    });

    if (!allowed) {
      await transaction.rollback();
      return res.status(403).json({
        message: "You do not have permission to create a team"
      });
    }

    /* ------------------ Update Complaint ------------------ */
    const old_status = complaint.status;

    complaint.status = "Verified";
    complaint.handling_unit = handling_unit;

    await complaint.save({ transaction });

    await ActivityLog.create({
      user_id: currentUser,
      entity_type: "Complaint",
      entity_id: complaint.complaint_id,
      old_status,
      new_status: complaint.status,
      description: `Complaint verified. Handling unit: ${handling_unit}. Investigation days: ${investigation_days}`
    }, { transaction });

    /* ------------------ Update Case ------------------ */
    const countdown_start = new Date();
    const countdown_end = addDays(countdown_start, investigation_days);

    await caseRecord.update({
      status: "teamCase",
      countdown_start_date: countdown_start,
      countdown_end_date: countdown_end
    }, { transaction });

    const existingTeam = await TeamCase.findOne({
      where: { case_id },
      transaction
    });

    if (existingTeam) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Team already exists for this case"
      });
    }

    /* ------------------ Team Members ------------------ */
    if (!Array.isArray(users) || users.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Users array required" });
    }

    const admins = await AdministratorAccounts.findAll({
      where: { user_id: { [Op.in]: users } },
      transaction
    });

    if (admins.length !== users.length) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Some users do not exist"
      });
    }

    const teamMembers = users.map(user_id => ({
      user_id,
      case_id,
      formed_by: formed_by || currentUser
    }));

    await TeamCase.bulkCreate(teamMembers, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: "Team created successfully",
      case_id,
      team: teamMembers
    });

  } catch (err) {
    console.error(err);
    await transaction.rollback();
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

exports.addUserToTeam = async (req, res) => {
  try {
    const { case_id, users } = req.body;
    const currentUser = req.user.id;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID." });
    }

    const userRole = await UserHasRole.findOne({ where: { user_id: currentUser } });
    if (!userRole) return res.status(403).json({ message: "You are not assigned to any role." });

    const rolePermissions = await RoleHasPermission.findAll({ where: { role_id: userRole.role_id } });
    const permissionIds = rolePermissions.map(rp => rp.permission_id);

    const allowed = await Permission.findOne({
      where: {
        permission_id: permissionIds,
        resource: "teamCase",
        action: "update"
      }
    });

    if (!allowed) {
      return res.status(403).json({
        message: "You do not have permission to update the team."
      });
    }

    if (!case_id || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "case_id and list of users are required" });
    }

    const existingTeam = await TeamCase.findAll({ where: { case_id } });
    if (existingTeam.length === 0) {
      return res.status(400).json({ message: "No existing team found for this case." });
    }

    const admins = await AdministratorAccounts.findAll({ where: { user_id: users } });
    if (admins.length !== users.length) {
      return res.status(400).json({
        message: "One or more user_id values do not exist in AdministratorAccounts."
      });
    }

    const existingUserIds = existingTeam.map(t => t.user_id);
    const filteredUsers = users.filter(u => !existingUserIds.includes(u));

    if (filteredUsers.length === 0) {
      return res.status(400).json({
        message: "All provided users already exist in the team."
      });
    }

    const newMembers = filteredUsers.map(user_id => ({
      user_id,
      case_id,
      formed_by: currentUser
    }));

    await TeamCase.bulkCreate(newMembers);

    return res.status(201).json({
      message: "Users successfully added to the team.",
      added: newMembers
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.removeUserFromTeam = async (req, res) => {
  try {
    const { case_id, users } = req.body;
    const currentUser = req.user.id;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID." });
    }

    const userRole = await UserHasRole.findOne({ where: { user_id: currentUser } });
    if (!userRole) return res.status(403).json({ message: "You are not assigned to any role." });

    const rolePermissions = await RoleHasPermission.findAll({ where: { role_id: userRole.role_id } });
    const permissionIds = rolePermissions.map(rp => rp.permission_id);

    const allowed = await Permission.findOne({
      where: {
        permission_id: permissionIds,
        resource: "teamCase",
        action: "delete"
      }
    });

    if (!allowed) {
      return res.status(403).json({
        message: "You do not have permission to remove team members."
      });
    }

    if (!case_id || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "case_id and array of users are required" });
    }

    const teamMembers = await TeamCase.findAll({
      where: { case_id, user_id: users }
    });

    if (teamMembers.length === 0) {
      return res.status(404).json({ message: "None of the provided users are in this team." });
    }

    const foundUserIds = teamMembers.map(m => m.user_id);
    const notFound = users.filter(u => !foundUserIds.includes(u));

    await TeamCase.destroy({
      where: { case_id, user_id: foundUserIds }
    });

    return res.status(200).json({
      message: "Users removed from team successfully.",
      removed: foundUserIds,
      not_found: notFound.length > 0 ? notFound : undefined
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.getTeamMembers = async (req, res) => {
  try {
    const { case_id } = req.params;

    if (!case_id) {
      return res.status(400).json({ message: "case_id is required" });
    }

    const teamMembers = await TeamCase.findAll({
      where: { case_id },
      include: [
        {
          model: AdministratorAccounts,
          as: "user",
          attributes: ["user_id", "name"]
        }
      ]
    });

    if (!teamMembers || teamMembers.length === 0) {
      return res.status(404).json({ message: "No team found for this case." });
    }

    return res.status(200).json({
      message: "Team members fetched successfully",
      team: teamMembers
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};