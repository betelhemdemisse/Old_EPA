'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      Feedback.belongsTo(models.Case, {
        foreignKey: 'case_id',
        as: 'case'
      });

      Feedback.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'user_id',
        as: 'user'
      });

      Feedback.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      Feedback.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
    }
  }

  Feedback.init({
    feedback_id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    case_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    stamp_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'Feedbacks',
    underscored: true,
    timestamps: false
  });

  return Feedback;
};
