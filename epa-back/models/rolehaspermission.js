'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RoleHasPermission extends Model {
    static associate(models) {
      // Associations
      RoleHasPermission.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role',
      });
      RoleHasPermission.belongsTo(models.Permission, {
        foreignKey: 'permission_id',
        as: 'permission',
      });
    }
  }

  RoleHasPermission.init(
    {
      role_has_permission_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
       created_by: {
        type: DataTypes.UUID,
        allowNull:true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull:true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      }
    },
    {
      sequelize,
      modelName: 'RoleHasPermission',
      tableName: 'RoleHasPermissions',
      timestamps: false,
    }
  );

  return RoleHasPermission;
};
