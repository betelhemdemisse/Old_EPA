'use strict';
/** @type {import('sequelize-cli').Migration} */
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('userHasHierarchies', {
      userHasHierarchy_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      organization_hierarchy_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'organizationHierarchies',
          key: 'organization_hierarchy_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('userHasHierarchies');
  }
};