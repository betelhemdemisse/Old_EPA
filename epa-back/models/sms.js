"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SMS extends Model {
    static associate(models) {}
  }
  SMS.init(
    {
      sms_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      sender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      recipient: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("sent", "pending", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updated_by: {
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
    },
    {
      sequelize,
      modelName: "SMS",
      tableName: "SMs",
      timestamps: false,
      underscored: true,
    }
  );
  return SMS;
};
