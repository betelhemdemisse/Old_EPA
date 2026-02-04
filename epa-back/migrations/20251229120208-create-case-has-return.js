"use strict";
/** @type {import('sequelize-cli').Migration} */
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CaseHasReturns", {
      case_has_return_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      case_id: {
        type: Sequelize.UUID,
        references: {
          model: "Cases",
          key: "case_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      rejection_reason_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      additional_description:{
          type: Sequelize.STRING,
          allowNull: false
      },
       rejected_by:{
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AdministratorAccounts",
          key: "user_id",
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AdministratorAccounts",
          key: "user_id",
        },
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AdministratorAccounts",
          key: "user_id",
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("CaseHasReturns");
  },
};
