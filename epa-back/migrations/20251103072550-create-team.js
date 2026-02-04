'use strict';
/** @type {import('sequelize-cli').Migration} */
const { DataTypes, Sequelize } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Teams', {
      team_id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      team_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      department_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Departments',
          key: 'department_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'PollutionCategories',
          key: 'pollution_category_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        // references: {
        //   model: 'AdministratorAccounts',
        //   key: 'user_id',
        // },
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        // references: {
        //   model: 'AdministratorAccounts',
        //   key: 'user_id',
        // },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Teams');
  }
};
