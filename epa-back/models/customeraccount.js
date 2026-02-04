'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CustomerAccount extends Model {}

  CustomerAccount.init(
    {
      customer_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
       email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      account_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,

      },
      is_guest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp_expiry: {
        type: DataTypes.DATE,
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
      modelName: 'CustomerAccount',
      tableName: 'CustomerAccounts',
      timestamps: false,
      underscored: true,
    }
  );

  return CustomerAccount;
};
