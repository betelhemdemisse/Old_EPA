"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface) => {
    const users = [
      {
        user_id: uuidv4(),
        name: "Admin",
        gender: "male",
        email: "admin@admin.com",
        isRegional: false, 
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "TaskForce",
        gender: "female",
        email: "taskforce@test.com",
        isRegional: false, 
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "Director",
        gender: "female",
        email: "director@user.com",
       
        isRegional: false, 
        password:
          "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "Deputy Director",
        gender: "female",
        email: "deputy@epa.gov.et",
        isRegional: false, 
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "Department Head",
        gender: "male",
        email: "depthead@epa.gov.et",
        isRegional: false, 
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "Team Head",
        gender: "male",
        email: "teamlead@epa.gov.et",
        isRegional: false, 
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "Expert",
        gender: "male",
        email: "expert@epa.gov.et",
        isRegional: false, 
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        isRegional: false, 
        created_at: new Date(),
        updated_at: new Date(),
      },

      // === Regional Users ===
    
    
   

      // === Regional Users ===
      {
        user_id: uuidv4(),
        name: "Oromia Region Admin",
        gender: "male",
        email: "region.oromia@epa.gov.et",
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        isRegional: true, 
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "Amhara Region Admin",
        gender: "female",
        email: "region.amhara@epa.gov.et",
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        isRegional: true, 
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "Oromia Zone Expert",
        gender: "male",
        email: "zone.addis@epa.gov.et",
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        isRegional: true, 
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "Oromia Woreda Expert",
        gender: "female",
        email: "woreda.diredawa@epa.gov.et",
        isRegional: true, 
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: uuidv4(),
        name: "Sidama Region Expert",
        gender: "male",
        email: "expert.sidama@epa.gov.et",
        isRegional: true, 
        password: "$2a$10$j2CE2yszJk9yUci.43YTeuwTSeQUKYxnsae0XKYUG/0JM9y5.Mel2",
        created_at: new Date(),
        updated_at: new Date(),
      },

      
    ];

    await queryInterface.bulkInsert("AdministratorAccounts", users);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("AdministratorAccounts", null, {});
  },
};