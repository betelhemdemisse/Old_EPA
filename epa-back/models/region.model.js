"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Region extends Model {
    static associate(models) {
      Region.hasMany(models.Zone, { foreignKey: "region_id", as: "zones" });
      Region.hasMany(models.City, { foreignKey: "city_id", as: "city" });

    }
  }

  Region.init(
    {
      region_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      region_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
       city_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
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
      modelName: "Region",
      tableName: "Regions",

      underscored: true,
    }
  );

  return Region;
};
