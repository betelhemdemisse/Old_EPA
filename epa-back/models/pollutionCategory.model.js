"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class PollutionCategory extends Model { }
  PollutionCategory.init(
    {
      pollution_category_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      pollution_category: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
      },

      is_sound: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    },

    {
      sequelize,
      modelName: "PollutionCategory",
      tableName: "PollutionCategories",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

    }
  );

  PollutionCategory.associate = (models) => {
    PollutionCategory.hasMany(models.SubPollutionCategory, {
      foreignKey: "pollution_category_id",
      as: "subcategories",
    });
  };

  return PollutionCategory;
};
