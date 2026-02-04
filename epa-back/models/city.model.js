"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class City extends Model {
    static associate(models) {
      City.hasMany(models.Subcity, { foreignKey: "city_id", as: "subcities" });
      City.belongsTo(models.Region, { foreignKey: "city_id", as: "regions" });
    }
  }

  City.init(
    {
      city_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
     
      city_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
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
      modelName: "City",
      tableName: "Cities",
      timestamps: true,
      underscored: true,
    }
  );

  return City;
};
