'use strict';
/** @type {import('sequelize-cli').Migration} */
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AdministratorAccounts', {
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
       isRegional: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      resetToken :{
        type:DataTypes.STRING(255),
        allowNull:true,
      },
      resetTokenExpiration:{
        type:DataTypes.DATE,
        allowNull:true,
      },
      status: {
       type: Sequelize.BOOLEAN,
       allowNull: false,
       defaultValue: true,
         },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AdministratorAccounts');
  },
};
