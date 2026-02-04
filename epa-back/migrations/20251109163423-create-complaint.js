'use strict';
const { DataTypes } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Complaint', {
      complaint_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'CustomerAccounts',
          key: 'customer_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      report_id:{
        type: Sequelize.STRING,
        allowNull: true,
      },
      region_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Regions',
          key: 'region_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      city_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Cities',
          key: 'city_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      subcity_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Subcities',
          key: 'subcity_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      pollution_category_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subpollution_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      zone_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Zones',
          key: 'zone_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      woreda_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Woredas',
          key: 'woreda_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      
      detail: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      location_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_Team_Formation_needed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM(
          "Pending",
          "Under Review",
          "Rejected",
          "Verified",
          "investigation_submitted",
          "Closed",
          "under_investigation",
          "Closed by pollutant not found"
        ),
        allowNull: false,
        defaultValue: "Pending",
      },
      // Rejection fields
      rejection_reason_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      rejection_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rejected_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejected_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      customer_otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      isGuest: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      act_date: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      act_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },

       specific_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      noise_area: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      noise_area_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      phone_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      accepted_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      handling_unit: {
       type: DataTypes.ENUM('temporary_team', 'regional_team', 'hq_expert'),
       allowNull: true, 
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Complaint');
  },
};
