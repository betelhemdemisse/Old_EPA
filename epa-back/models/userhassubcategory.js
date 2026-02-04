'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserHasSubCategory extends Model {
    static associate(models) {
      UserHasSubCategory.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'user_id',
        as: 'user',
      });

      UserHasSubCategory.belongsTo(models.SubPollutionCategory, {
        foreignKey: 'sub_pollution_category_id',
        as: 'subPollutionCategory',
      });

      UserHasSubCategory.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'createdBy',
      });

      UserHasSubCategory.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updatedBy',
      });
     }
  }

  UserHasSubCategory.init(
    {
      user_has_sub_pullution_category_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      sub_pollution_category_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true
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
      modelName: 'UserHasSubCategory',
      tableName: 'UserHasSubCategories',
      underscored: true, 
      timestamps: true,
    }
  );

  return UserHasSubCategory;
};
