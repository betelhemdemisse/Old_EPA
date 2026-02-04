"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class SubPollutionCategory extends Model {}
  SubPollutionCategory.init(
    {
      sub_pollution_category_id: {
        type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      pollution_category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "PollutionCategories", key: "pollution_category_id" },
      },
      sub_pollution_category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
        investigation_days:{
        type: DataTypes.INTEGER,
        allowNull: true
      },
      description: DataTypes.STRING,
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
        allowNull:true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull:true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      }
    },
    {
      sequelize,
      modelName: "SubPollutionCategory",
      tableName: "SubPollutionCategories",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );


SubPollutionCategory.associate = (models) => {
  SubPollutionCategory.belongsTo(models.PollutionCategory, {
    foreignKey: "pollution_category_id",
    as: "pollution_category", 
  });
  SubPollutionCategory.hasOne(models.ReportType, {
      foreignKey: "sub_pollution_category_id",
      as: "report_types",
    });
};

  return SubPollutionCategory;
};
