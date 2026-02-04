"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const make = (resource, action) => ({
      permission_id: uuidv4(),
      resource,
      action,
      created_at: now,
      updated_at: now,
    });

    const permissions = [
      
      make("User", "create"),
      make("User", "read"),
      make("User", "update"),
      make("User", "delete"),
   
      make("Role", "create"),
      make("Role", "read"),
      make("Role", "update"),
      make("Role", "delete"),
// pass
      make("BaseData", "create"),
      make("BaseData", "read"),
      make("BaseData", "update"),
      make("BaseData", "delete"),

      make("Dashboard","read"),

      make("mainDirector", "create"),
      make("mainDirector", "read"),
      make("mainDirector", "update"),
      make("mainDirector", "delete"),
      
      make("taskForce", "can-get-complaint"),
      make("taskForce", "can-verify-complaint"),

      make("deputyDirector", "create"),
      make("deputyDirector", "read"),
      make("deputyDirector", "update"),
      make("deputyDirector", "delete"),
      make("deputyDirector", "approve_and_reject"),

      make("departmentHead", "create"),
      make("departmentHead", "read"),
      make("departmentHead", "update"),
      make("departmentHead", "delete"),
      make("departmentHead", "approve_and_reject"),

      make("teamLead","can-upload-investigation"),
      
      make("teamHead", "create"),
      make("teamHead", "read"),
      make("teamHead", "update"),
      make("teamHead", "delete"),
      make("teamHead", "approve_and_reject"),

      make("expert", "create"),
      make("expert", "report-list-read"),
      make("expert", "update"),
      make("expert", "delete"),
      make("expert", "can-get-case"),
      make("expert", "can-upload-investigation"),

      make("teamCase", "create"),
      make("teamCase", "update"),
      make("teamCase", "delete"),
      make("teamCase", "read"),

      make("case", "can-extend-investigation"),
      make("case", "can-reduce-investigation"),


      make("reportType", "create"),
      make("reportType", "read"),
      make("reportType", "update"),
      make("reportType", "delete"),

      make("reportForm", "create"),
      make("reportForm", "read"),
      make("reportForm", "update"),
      make("reportForm", "delete"),

      make("formType", "create"),
      make("formType", "read"),
      make("formType", "update"),
      make("formType", "delete"),

      make("region", "can-get-complaint"),
      make("region", "can-assign"),
      make("region", "can-review-investigation"),
     
      make("zone", "can-get-complaint"),
      make("zone", "can-assign"),

      make("woreda", "can-get-complaint"),
      make("woreda", "can-assign-to-expert"),

      make("complaint", "assign_to_region"),
      make("complaint", "close"),
      make("complaint", "assign_to_zone"),
      make("complaint", "assign_to_region_expert"),
      make("complaint", "assign_to_woreda"),
      make("complaint", "assign_to_zone_expert"),
      make("complaint", "assgn_to_woreda_expert"),
      make("complaint", "resolve"),
    ];
    await queryInterface.bulkInsert("Permissions", permissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Permissions", null, {});
  },
};
