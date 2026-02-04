'use strict';
/** @type {import('sequelize-cli').Migration} */
const { DataTypes, Sequelize } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Awareness', {
      awareness_id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      awareness_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      file_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      file_name: {
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
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Awareness');
  }
};
