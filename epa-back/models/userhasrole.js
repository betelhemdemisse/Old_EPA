'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserHasRole extends Model {
    static associate(models) {
      UserHasRole.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'user_id',
        as: 'user',
      });
      UserHasRole.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role',
      });
    }
  }

  UserHasRole.init(
    {
      user_has_role_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      modelName: 'UserHasRole',
      tableName: 'UserHasRoles',
      timestamps: false, 
    }
  );

  return UserHasRole;
};
