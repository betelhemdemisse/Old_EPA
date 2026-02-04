// seeders/20251209080837-demo-role-has-permission.js

"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch all roles and permissions
    const [roles] = await queryInterface.sequelize.query(`SELECT role_id, name FROM "Roles";`);
    const [permissions] = await queryInterface.sequelize.query(`SELECT permission_id, resource, action FROM "Permissions";`);

    if (!roles.length || !permissions.length) {
      throw new Error("Roles or Permissions table is empty. Run previous seeders first.");
    }

    // Mapping: Role Name → Resource(s) it should have
    const roleResourceMap = {
      Admin: "ALL", // Gets everything
      TaskForce: "taskForce",
      Director: "mainDirector",
      "Deputy Director": "duptyDirector",
      "Department Head": "departmentHead",
      "Team Lead": "teamHead",
      "Expert": "expert",

      "Region Admin": "region", 
      "Zone Admin": "zone",
      "Woreda Admin": "woreda",
    };

    const roleHasPermissions = [];

    for (const role of roles) {
      const expectedResource = roleResourceMap[role.name];

      let matchedPermissions = [];

      if (expectedResource === "ALL") {
        // Admin gets every single permission
        matchedPermissions = permissions;
      } else if (expectedResource) {
        // Match by resource (e.g. 'region', 'regionExpert', 'taskForce', etc.)
        matchedPermissions = permissions.filter((p) => p.resource === expectedResource);
      }
      // If role not in map → no permissions (safe fallback)

      matchedPermissions.forEach((perm) => {
        roleHasPermissions.push({
          role_has_permission_id: uuidv4(),
          role_id: role.role_id,
          permission_id: perm.permission_id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    }
    console.log(`Seeding ${roleHasPermissions.length} role-permission links...`);
    await queryInterface.bulkInsert("RoleHasPermissions", roleHasPermissions);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("RoleHasPermissions", null, {});
  },
};