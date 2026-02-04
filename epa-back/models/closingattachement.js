'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ClosingAttachement extends Model {
    static associate(models) {
      ClosingAttachement.belongsTo(models.Case, {
        foreignKey: 'case_id',
        targetKey: 'case_id',
        as: 'case',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
       ClosingAttachement.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'creator',
      });
      ClosingAttachement.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updater',
      });
    }
  }

  ClosingAttachement.init(
    {
      closing_attachement_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      case_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      file_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      file_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description:{
        type: DataTypes.TEXT,
        allowNull: true,
      },
       created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.UUID,
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
    },
    {
      sequelize,
      modelName: 'ClosingAttachement',
      tableName: 'ClosingAttachements',

      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',

      underscored: true,
    }
  );

  return ClosingAttachement;
};
