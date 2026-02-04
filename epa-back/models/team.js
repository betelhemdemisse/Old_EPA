'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model { }
  Team.init({
    team_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'department_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'PollutionCategories',
        key: 'pollution_category_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    team_name: {
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
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};