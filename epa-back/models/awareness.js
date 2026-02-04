'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Awareness extends Model { }

  Awareness.init(
    {
      awareness_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      awareness_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      file_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      file_name: {
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
        }
      },

      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id',
        }
      }
    },
    {
      sequelize,
      modelName: 'Awareness',
      tableName: 'Awareness',
    }
  );

  return Awareness;
};
