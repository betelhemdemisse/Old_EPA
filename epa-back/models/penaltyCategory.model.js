'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PenaltyCategory extends Model {
    static associate(models) {

      PenaltyCategory.belongsTo(models.AdministratorAccounts, {
        as: 'creator',
        foreignKey: 'created_by'
      });
      PenaltyCategory.hasMany(models.PenalitySubCategory, {
        foreignKey: "penalty_id",
        as: "penalitySubCategory",
      });
      PenaltyCategory.belongsTo(models.AdministratorAccounts, {
        as: 'updater',
        foreignKey: 'updated_by'
      });
    }
  }

  PenaltyCategory.init(
    {
      penalty_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },

      penalty_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      modelName: 'PenaltyCategory',
      tableName: 'PenaltyCategories',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PenaltyCategory;
};
