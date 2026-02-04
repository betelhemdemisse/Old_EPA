'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReportSubmissions extends Model {
    static associate(models) {
      ReportSubmissions.belongsTo(models.Case, {
        foreignKey: 'case_id',
        as: 'case'
      });
      ReportSubmissions.belongsTo(models.PenalitySubCategory, {
        foreignKey: 'penality_sub_category_id',
        as: 'penalitySubCategory'
      });

      ReportSubmissions.belongsTo(models.ReportType, {
        foreignKey: 'report_type_id',
        as: 'reportType'
      });

      ReportSubmissions.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      ReportSubmissions.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
      ReportSubmissions.hasMany(models.ReportSubmissionValues, {
        foreignKey: 'report_submission_id',
        as: 'values',
      });
    }
  }

  ReportSubmissions.init(
    {
      report_submission_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      case_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      penality_sub_category_id:{
        type: DataTypes.UUID,
        allowNull: false,
      },
      report_type_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ReportSubmissions',
      tableName: 'ReportSubmissions',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ReportSubmissions;
};
