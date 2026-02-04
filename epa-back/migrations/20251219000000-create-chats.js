'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chats', {
      chat_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      complaint_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Complaint',
          key: 'complaint_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('feedback', 'issue', 'extension'),
        allowNull: false,
        defaultValue: 'feedback'
      },
      status: {
        type: Sequelize.ENUM('active', 'resolved', 'investigating', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'active'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: true,
        defaultValue: 'medium'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requested_extension: {
        type: Sequelize.DATE,
        allowNull: true
      },
      original_deadline: {
        type: Sequelize.DATE,
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

    // Add indexes
    await queryInterface.addIndex('chats', ['complaint_id']);
    await queryInterface.addIndex('chats', ['type']);
    await queryInterface.addIndex('chats', ['status']);
    await queryInterface.addIndex('chats', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chats');
  }
};
