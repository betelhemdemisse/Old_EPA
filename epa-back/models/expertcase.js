'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExpertCase extends Model {
    static associate(models) {
      ExpertCase.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'user_id',
        as: 'user'
      });

      ExpertCase.belongsTo(models.Case, {
        foreignKey: 'case_id',
        as: 'case'
      });

      ExpertCase.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      ExpertCase.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
    }
  }

  ExpertCase.init({
    expert_case_id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    case_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
     status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: true,
        defaultValue: "active"
      },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ExpertCase',
    tableName: 'ExpertCases',
    underscored: true,
    timestamps: false
  });

  return ExpertCase;
};
