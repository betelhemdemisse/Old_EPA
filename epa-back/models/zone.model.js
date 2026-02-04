"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Zone extends Model {
    static associate(models) {
      Zone.belongsTo(models.Region, { foreignKey: "region_id", as: "region" });
      Zone.hasMany(models.Woreda, { foreignKey: "zone_id", as: "woreda" });
    }
  }

  Zone.init(
    {
      zone_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true,
      },
      region_id: {
        type: DataTypes.UUID,
        allowNull:false,
      },
      zone_name: {
        type: DataTypes.STRING,
        allowNull:false,
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
      modelName: "Zone",
      tableName: "Zones",
      timestamps: true,
      underscored: true,
    }
  );

  return Zone;
};
