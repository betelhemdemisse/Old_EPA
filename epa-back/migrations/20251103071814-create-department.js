'use strict';
/** @type {import('sequelize-cli').Migration} */
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid"); 
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Departments', {
      department_id: {
         type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      department_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      //  created_by: {
      //   type: DataTypes.UUID,
      //  allowNull:true,
      //   references: {
      //     model: 'AdministratorAccounts',
      //     key: 'user_id'
      //   }
      // },
      // updated_by: {
      //  type: DataTypes.UUID,
      //  allowNull:true,
      //   references: {
      //     model: 'AdministratorAccounts',
      //     key: 'user_id'
      //   }
      // }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Departments');
  },
};
