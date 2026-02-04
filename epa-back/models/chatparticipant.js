'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatParticipant extends Model {
    static associate(models) {
      // A chat participant belongs to a chat
      ChatParticipant.belongsTo(models.Chat, {
        foreignKey: 'chat_id',
        as: 'chat'
      });

      // A chat participant belongs to a user
      ChatParticipant.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  ChatParticipant.init({
    chat_participant_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    chat_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chats',
        key: 'chat_id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'AdministratorAccounts',
        key: 'user_id'
      }
    },
    role: {
      type: DataTypes.ENUM('initiator', 'receiver', 'participant', 'moderator'),
      allowNull: false,
      defaultValue: 'participant'
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ChatParticipant',
    tableName: 'chat_participants',
    timestamps: false
  });

  return ChatParticipant;
};
