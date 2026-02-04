"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CaseHasReturn extends Model {
    static associate(models) {
       if (models.RejectionReason) {
        CaseHasReturn.belongsTo(models.RejectionReason, {
          foreignKey: "rejection_reason_id",
          as: "rejection_reason",
        });
        CaseHasReturn.belongsTo(models.AdministratorAccounts, {
          foreignKey: "rejected_by",
          as: "rejectedBy",
        });
      }
    }
  }
  CaseHasReturn.init(
    {
      case_has_return_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      case_id:{
        type: DataTypes.UUID,
        allowNull: false,
      },
     rejection_reason_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "RejectionReasons",
          key: "rejection_reason_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      additional_description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      rejected_by:{
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
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CaseHasReturn",
    }
  );
  return CaseHasReturn;
};
