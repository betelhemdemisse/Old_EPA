// seeders/20251103111000-demo-roles.js

"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete("Roles", null, {});

    const roles = [
      {
        role_id: uuidv4(),
        name: "Admin",
        description: "System Administrator with full access",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: uuidv4(),
        name: "TaskForce",
        description: "Central Taskforce - receives, verifies, and routes complaints",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: uuidv4(),
        name: "Director",
        description: "Main Director - highest authority",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: uuidv4(),
        name: "Deputy Director",
        description: "Deputy Director - approves/rejects HQ investigations",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: uuidv4(),
        name: "Department Head",
        description: "Department Head - approves/rejects after Team Lead",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: uuidv4(),
        name: "Team Lead",
        description: "Team Lead - first level approval of expert investigations",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: uuidv4(),
        name: "Expert",
        description: "HQ Expert - handles central (non-regional) investigations",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // === REGIONAL ROLES ===
      {
        role_id: uuidv4(),
        name: "Region Admin",
        description: "Regional Administrator - pulls regional complaints and assigns to experts",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: uuidv4(),
        name: "Region Expert",
        description: "Regional Expert (Region/Zone/Woreda level) - conducts field investigation",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: uuidv4(),
        name: "Zone Admin",
        description: "Zone Administrator - pulls zone complaints and assigns to experts",
        created_at: new Date(),
        updated_at: new Date(),
      },
       {
        role_id: uuidv4(),
        name: "Zone Expert",
        description: "Expert assigned to Zone-level office",
        created_at: new Date(),
        updated_at: new Date(),
      },
        {
        role_id: uuidv4(),
        name: "Woreda Admin",
        description: "Woreda Administrator - pulls woreda complaints and assigns to experts",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: uuidv4(),
        name: "Woreda Expert",
        description: "Expert assigned to Woreda-level office",
        created_at: new Date(),
        updated_at: new Date(),
      },

    ];

    await queryInterface.bulkInsert("Roles", roles);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};