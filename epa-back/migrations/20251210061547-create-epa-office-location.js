'use strict';
/** @type {import('sequelize-cli').Migration} */
const { DataTypes, Sequelize } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EpaOfficeLocations', {
      epa_office_location_id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      latitude: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      longitude: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      description: {
        type: Sequelize.STRING,
        allowNull: true,
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
      },

      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EpaOfficeLocations');
  }
};
