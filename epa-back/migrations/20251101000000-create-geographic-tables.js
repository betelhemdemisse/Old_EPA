'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Regions table
    await queryInterface.createTable('Regions', {
      region_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      region_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
    
    });

    // Create Zones table
    await queryInterface.createTable('Zones', {
      zone_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      region_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Regions',
          key: 'region_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      zone_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

   

    await queryInterface.createTable('Cities', {
      city_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      city_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
     
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create Subcities table
    await queryInterface.createTable('Subcities', {
      subcity_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      city_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Cities',
          key: 'city_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subcity_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
 // Create Woredas table
    await queryInterface.createTable('Woredas', {
      woreda_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      zone_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Zones',
          key: 'zone_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
       subcity_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Subcities',
          key: 'subcity_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      woreda_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    // Create indexes for better performance
    await queryInterface.addIndex('Zones', ['region_id']);
    await queryInterface.addIndex('Woredas', ['zone_id']);
    await queryInterface.addIndex('Subcities', ['city_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order of creation
    await queryInterface.dropTable('Subcities');
    await queryInterface.dropTable('Cities');
    await queryInterface.dropTable('Woredas');
    await queryInterface.dropTable('Zones');
    await queryInterface.dropTable('Regions');
  }
};