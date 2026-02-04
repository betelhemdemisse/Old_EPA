'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ExpertCases', {
      expert_case_id: {
       type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      user_id: {
          type: Sequelize.UUID,
          references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      case_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Cases',
          key: 'case_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status:{
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: true,
        defaultValue: 'active'
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
    await queryInterface.dropTable('ExpertCases');
  }
};
