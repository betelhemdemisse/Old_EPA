'use strict';
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Pollution Categories table
    await queryInterface.createTable('PollutionCategories', {
      pollution_category_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      pollution_category: {
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
      // created_by: {
      //  type: DataTypes.UUID,
      //   references: {
      //     model: 'AdministratorAccounts',
      //     key: 'user_id'
      //   }
      // },
      // updated_by: {
      //    type: DataTypes.UUID,
      //   references: {
      //     model: 'AdministratorAccounts',
      //     key: 'user_id'
      //   }
      // }
    });

    // Create Sub-Pollution Categories table
    await queryInterface.createTable('SubPollutionCategories', {
      sub_pollution_category_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      pollution_category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'PollutionCategories',
          key: 'pollution_category_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sub_pollution_category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      investigation_days:{
        type: Sequelize.INTEGER,
         allowNull: true
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
      // created_by: {
      //   type: DataTypes.UUID,
      //   references: {
      //     model: 'AdministratorAccounts',
      //     key: 'user_id'
      //   }
      // },
      // updated_by: {
      //   type: DataTypes.UUID,
      //   references: {
      //     model: 'AdministratorAccounts',
      //     key: 'user_id'
      //   }
      // }
    });

    await queryInterface.createTable('PenaltyCategories', {
      penalty_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },

      penalty_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

      // created_by: {
      //   type: DataTypes.UUID,
      //   references: {
      //     model: 'AdministratorAccounts',
      //     key: 'user_id'
      //   }
      // },

      // updated_by: {
      //   type: DataTypes.UUID,
      //   references: {
      //     model: 'AdministratorAccounts',
      //     key: 'user_id'
      //   }
      // }
    });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Penalties');
    await queryInterface.dropTable('SubPollutionCategories');
    await queryInterface.dropTable('PollutionCategories');
  }
};