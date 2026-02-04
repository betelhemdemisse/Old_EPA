'use strict';
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid"); 
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RoleHasPermissions', {
      role_has_permission_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      role_id: {
         type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'role_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permission_id: {
         type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Permissions',
          key: 'permission_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
       created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RoleHasPermissions');
  },
};
