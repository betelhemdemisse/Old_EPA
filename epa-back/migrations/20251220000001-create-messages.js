'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      message_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      chat_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'chats',
          key: 'chat_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('complaint', 'response', 'follow_up', 'issue_report', 'extension_request', 'acceptance'),
        allowNull: false,
        defaultValue: 'complaint'
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('messages', ['chat_id']);
    await queryInterface.addIndex('messages', ['sender_id']);
    await queryInterface.addIndex('messages', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  }
};
