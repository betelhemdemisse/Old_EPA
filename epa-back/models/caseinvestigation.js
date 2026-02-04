'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CaseInvestigation extends Model {
    static associate(models) {
      this.belongsTo(models.Case, {
        foreignKey: 'case_id',
        as: 'case'
      });

      this.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      this.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
      
      this.hasMany(models.CaseAttachement, {
        foreignKey: 'case_investigation_id',
        as: 'case_attachement'
      });
    }
  }

  CaseInvestigation.init(
    {
      case_investigation_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      case_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
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
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'CaseInvestigation',
      tableName: 'CaseInvestigations',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return CaseInvestigation;
};
