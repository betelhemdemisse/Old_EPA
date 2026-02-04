'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cases', {
      case_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      case_no: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      complaint_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Complaint',
          key: 'complaint_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      status: {
        type: Sequelize.STRING,
      },

      countdown_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      status_changed_by: {
        type: Sequelize.UUID,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      investigation_days:{
        type: Sequelize.INTEGER,
         allowNull: true
      },
      reminder_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      countdown_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      extended_days: {
        type: Sequelize.STRING
      },

      is_extended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_opened: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      extended_by: {
        type: Sequelize.UUID,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('Cases');
  }
};
