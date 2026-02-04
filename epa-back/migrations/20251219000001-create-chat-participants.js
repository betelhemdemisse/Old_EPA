'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_participants', {
      chat_participant_id: {
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
      user_id: {
      type: Sequelize.UUID,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      role: {
        type: Sequelize.ENUM('initiator', 'participant', 'moderator'),
        allowNull: false,
        defaultValue: 'participant'
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('chat_participants', ['chat_id']);
    await queryInterface.addIndex('chat_participants', ['user_id']);
    await queryInterface.addIndex('chat_participants', ['role']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chat_participants');
  }
};
