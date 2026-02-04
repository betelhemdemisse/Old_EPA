'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model { }

  Role.init(
    {
      role_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      modelName: 'Role',
      tableName: 'Roles', 
      timestamps: false,  
    }
  );
 Role.associate = (models) => {
    Role.hasMany(models.RoleHasPermission, {
      foreignKey: "role_id",
      otherKey: "permission_id",
      as: "roleHasPermissions",
    });

    Role.hasMany(sequelize.models.UserHasRole, {
      foreignKey: "role_id",
      as: "roleUsers",
    });

    Role.belongsToMany(sequelize.models.AdministratorAccounts, {
      through: sequelize.models.UserHasRole,
      foreignKey: "role_id",
      otherKey: "user_id",
      as: "users",
    });

    Role.belongsToMany(sequelize.models.Permission, {
      through: sequelize.models.RoleHasPermission,
      foreignKey: "role_id",
      otherKey: "permission_id",
      as: "permissions",
    });
  };

  return Role;
};
