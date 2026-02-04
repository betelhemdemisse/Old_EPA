"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PenalitySubCategory extends Model {
    static associate(models) {
      PenalitySubCategory.belongsTo(models.PenaltyCategory, {
        foreignKey: "penalty_id",
        targetKey: "penalty_id", 
        as: "category",
      });
      PenalitySubCategory.hasMany(models.ReportSubmissions, {
        foreignKey: "penality_sub_category_id",
        as: "reportSubmissions",
      });
    }
  }

  PenalitySubCategory.init(
    {
      penality_sub_category_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      penalty_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      issue_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
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
      modelName: "PenalitySubCategory",
      tableName: "PenalitySubCategories",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return PenalitySubCategory;
};
