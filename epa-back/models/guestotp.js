'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GuestOTP extends Model {
    static associate(models) {
    }
  }
  GuestOTP.init(
    {
      guestotp_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'GuestOTP',
      tableName: 'GuestOTPs',
      underscored: true,
      timestamps: true,
    }
  );
  return GuestOTP;
};
