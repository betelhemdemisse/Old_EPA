"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Subcity extends Model {
    static associate(models) {
      Subcity.belongsTo(models.City, { foreignKey: "city_id", as: "city" });
      Subcity.hasMany(models.Woreda, { foreignKey: "subcity_id", as: "woredas" });
    }
  }

  Subcity.init(
    {
      subcity_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      city_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subcity_name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "Subcity",
      tableName: "Subcities",
      
      underscored: true,
    }
  );

  return Subcity;
};
