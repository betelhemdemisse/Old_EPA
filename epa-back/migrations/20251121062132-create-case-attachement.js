'use strict';
/** @type {import('sequelize-cli').Migration} */
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CaseAttachements', {
      case_attachement_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      case_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Cases',
          key: 'case_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      case_investigation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'CaseInvestigations',
          key: 'case_investigation_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isFinal: {
        type: Sequelize.BOOLEAN, // ✅ fixed
        allowNull: false,
        defaultValue: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.UUID,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CaseAttachements');
  }
};
