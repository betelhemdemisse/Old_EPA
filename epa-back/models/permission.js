'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      Permission.hasMany(models.RoleHasPermission, {
        foreignKey: 'permission_id',
        as: 'roleHasPermissions',
      });
      Permission.belongsToMany(models.Role, {
        through: models.RoleHasPermission,
        foreignKey: 'permission_id',
        otherKey: 'role_id',
        as: 'roles',
      });
    }
  }

  Permission.init(
    {
      permission_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resource: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
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
    },
    {
      sequelize,
      modelName: 'Permission',
      tableName: 'Permissions',
      timestamps: false,
    }
  );

  return Permission;
};
