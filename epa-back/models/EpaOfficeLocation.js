'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EpaOfficeLocation extends Model { }

  EpaOfficeLocation.init(
    {
      epa_office_location_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      latitude: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      longitude: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      description: {
        type: DataTypes.STRING,
        allowNull: true,
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
          key: 'user_id',
        },
      },

      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id',
        },
      }
    },
    {
      sequelize,
      modelName: 'EpaOfficeLocation',
      tableName: 'EpaOfficeLocations',
    }
  );

  return EpaOfficeLocation;
};
