'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReportingForm extends Model {
    static associate(models) {
      ReportingForm.belongsTo(models.ReportType, {
        foreignKey: 'report_type_id',
        as: 'reportType',
      });
       ReportingForm.belongsTo(models.FormType, {
        foreignKey: 'form_type_id',
        as: 'formType',
      });
      ReportingForm.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'creator',
      });
      ReportingForm.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updater',
      });
    }
  }

  ReportingForm.init(
    {
      report_form_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      report_form: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      input_type: {
        type: DataTypes.ENUM(
          'text',
          'number',
          'textarea',
          'select',
          'checkbox',
          'radio',
          'date',
          'file'
        ),
        allowNull: false,
      },
      options: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      form_type_id: {
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
      modelName: 'ReportingForm',
      tableName: 'ReportingForms',
      underscored: true,
      timestamps: false,
    }
  );

  return ReportingForm;
};
