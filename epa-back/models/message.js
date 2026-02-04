'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // A message belongs to a chat
      Message.belongsTo(models.Chat, {
        foreignKey: 'chat_id',
        as: 'chat'
      });

      // A message belongs to a user (sender)
      Message.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'sender_id',
        as: 'sender'
      });
    }
  }

  Message.init({
    message_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      autoIncrement: true
    },
    chat_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chats',
        key: 'chat_id'
      }
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'AdministratorAccounts',
        key: 'user_id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'complaint', 
        'response', 
        'follow_up', 
        'issue', 

        'system',
        'feedback',
        'extension',  
        'acceptance'
      ),
      allowNull: false,
      defaultValue: 'complaint'
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Message;
};
