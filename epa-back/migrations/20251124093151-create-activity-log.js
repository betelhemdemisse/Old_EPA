'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityLogs', {
      activity_log_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: Sequelize.UUID, allowNull: false },
      entity_type: { type: Sequelize.STRING, allowNull: false },
      entity_id: { type: Sequelize.UUID, allowNull: false },
      old_status: { type: Sequelize.STRING, allowNull: false },
      new_status: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      rejection_reason_id :{type : Sequelize.UUID, allowNull: true  },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ActivityLogs');
  },
};
