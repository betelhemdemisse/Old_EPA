'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserHasTeam extends Model {
    static associate(models) {
      UserHasTeam.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'user_id',
        as: 'user',
      });

      UserHasTeam.belongsTo(models.Team, {
        foreignKey: 'team_id',
        as: 'team',
      });

      UserHasTeam.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'createdBy',
      });

      UserHasTeam.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updatedBy',
      });
    }
  }

  UserHasTeam.init(
    {
      user_has_team_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      team_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.UUID,
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
    },
    {
      sequelize,
      modelName: 'UserHasTeam',
      tableName: 'UserHasTeams',
      underscored: true,
      timestamps: true,
    }
  );

  return UserHasTeam;
};
