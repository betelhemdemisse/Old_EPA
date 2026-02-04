'use strict';

/** @type {import('sequelize-cli').Migration} */
const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organizationHierarchies', {
      organization_hierarchy_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'organizationHierarchies',
          key: 'organization_hierarchy_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      hierarchy_name: {
        type: DataTypes.STRING,
        allowNull: false,
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
        isRegional: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
        created_by: {
          type: Sequelize.UUID,
          references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
          type: Sequelize.UUID,
          references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('organizationHierarchies');
  }
};
