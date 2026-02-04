"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReportType extends Model {
    static associate(models) {
      ReportType.hasMany(models.ReportingForm, {
        foreignKey: "report_type_id",
        as: "reportingForm",
      });
      ReportType.belongsTo(models.AdministratorAccounts, {
        foreignKey: "created_by",
        as: "creator",
      });
      ReportType.belongsTo(models.AdministratorAccounts, {
        foreignKey: "updated_by",
        as: "updater",
      });
      ReportType.belongsTo(models.SubPollutionCategory, {
        foreignKey: "sub_pollution_category_id",
        as: "sub_pollution_category",
      });
      
    }
  }
  ReportType.init(
    {
      report_type_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      report_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sub_pollution_category_id: {
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
      modelName: "ReportType",
    }
  );
  return ReportType;
};
