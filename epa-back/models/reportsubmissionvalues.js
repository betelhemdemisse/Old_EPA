'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReportSubmissionValues extends Model {
    static associate(models) {
      ReportSubmissionValues.belongsTo(models.ReportSubmissions, {
        foreignKey: 'report_submission_id',
        as: 'submission',
      });

      ReportSubmissionValues.belongsTo(models.ReportingForm, {
        foreignKey: 'report_form_id',
        as: 'form',
      });
      ReportSubmissionValues.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'creator',
      });
      ReportSubmissionValues.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updater',
      });
    }
  }

  ReportSubmissionValues.init({
    report_submission_value_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    report_submission_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    report_form_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
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
  }, {
    sequelize,
    modelName: 'ReportSubmissionValues',
    tableName: 'ReportSubmissionValues',
    timestamps: false,
  });

  return ReportSubmissionValues;
};
