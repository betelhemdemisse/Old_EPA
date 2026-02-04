'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RejectionReason extends Model {
    static associate(models) {
      RejectionReason.hasMany(models.ActivityLog, {
        foreignKey: 'rejection_reason_id',
        as: 'activityLogs',
      });
      RejectionReason.hasMany(models.CaseHasReturn, {
        foreignKey: 'rejection_reason_id',
        as: 'caseHasReturns',
      });
    }
  }

  RejectionReason.init(
    {
      rejection_reason_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
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
      modelName: 'RejectionReason',
      tableName: 'RejectionReasons',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RejectionReason;
};
