'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.AdministratorAccounts, { foreignKey: 'user_id', as: 'user' });
    }
  }

  ActivityLog.init({
    activity_log_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: DataTypes.UUID,
    entity_type: DataTypes.STRING,
    entity_id: DataTypes.UUID,
    old_status: DataTypes.STRING,
    new_status: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'ActivityLogs',
    createdAt: 'created_at',
    updatedAt: false,
  });

  return ActivityLog;
};