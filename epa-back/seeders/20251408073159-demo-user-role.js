// seeders/20251408073159-demo-user-role.js

"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface) => {
    // 1. Load users (by name) and roles
    const [users] = await queryInterface.sequelize.query(
      `SELECT user_id, name FROM "AdministratorAccounts";`
    );

    const [roles] = await queryInterface.sequelize.query(
      `SELECT role_id, name FROM "Roles";`
    );

    if (!users.length || !roles.length) {
      throw new Error("AdministratorAccounts or Roles table is empty. Run previous seeders first.");
    }

    // Role name → role_id map
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.role_id]));

    // Mapping: User.name → Role name (exact match on name only)
    const userNameToRoleMap = {
      "Admin": "Admin",
      "TaskForce": "TaskForce",
      "Director": "Director",
      "Deputy Director": "Deputy Director",
      "Department Head": "Department Head",
      "Team Head": "Team Lead",
      "Expert": "Expert",

      // Regional users – matched by their full name
      "Oromia Region Admin": "Region Admin",
      "Amhara Region Admin": "Region Admin",
      "Oromia Zone Admin": "Zone Admin",
      "Oromia Woreda Admin": "Woreda Admin",
      "Oromia Zone Expert": "Expert",
      "Oromia Woreda Expert": "Expert",
      "Sidama Region Expert": "Expert",
    };

    const records = [];

    for (const user of users) {
      const targetRoleName = userNameToRoleMap[user.name];

      if (!targetRoleName) {
        console.warn(`Warning: No role mapped for user with name "${user.name}"`);
        continue;
      }

      const role_id = roleMap[targetRoleName];
      if (!role_id) {
        console.warn(`Warning: Role "${targetRoleName}" not found in Roles table`);
        continue;
      }

      records.push({
        user_has_role_id: uuidv4(),
        user_id: user.user_id,
        role_id: role_id,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    if (records.length === 0) {
      throw new Error("No user-role assignments were created. Check the name mapping.");
    }

    console.log(`Assigning ${records.length} role(s) to users based on name...`);
    await queryInterface.bulkInsert("UserHasRoles", records);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("UserHasRoles", null, {});
  },
};