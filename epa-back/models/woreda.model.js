"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Woreda extends Model {
    static associate(models) {
      Woreda.belongsTo(models.Zone, { foreignKey: "zone_id", as: "zone" });
      Woreda.belongsTo(models.Subcity, { foreignKey: "subcity_id", as: "subcity" });
      
    }
  }

  Woreda.init(
    {
      woreda_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      zone_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      subcity_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      woreda_name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "Woreda",
      tableName: "Woredas",
      timestamps: true,
      underscored: true,
    }
  );

  return Woreda;
};
