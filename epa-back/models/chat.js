'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {

      // Chat belongs to a complaint
      Chat.belongsTo(models.Complaint, {
        foreignKey: 'complaint_id',
        as: 'complaint'
      });

      // Chat has many messages
      Chat.hasMany(models.Message, {
        foreignKey: 'chat_id',
        as: 'messages'
      });

      // Chat participants (admins, experts, etc.)
      Chat.belongsToMany(models.AdministratorAccounts, {
        through: models.ChatParticipant,
        foreignKey: 'chat_id',
        otherKey: 'user_id',
        as: 'participants'
      });

      // Chat receiver (single assigned admin)
      Chat.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'receiver_id',
        as: 'receiver'
      });
    }
  }

  Chat.init(
    {
      chat_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },

      complaint_id: {
        type: DataTypes.UUID,
        allowNull: true
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false
      },

      type: {
        type: DataTypes.ENUM('feedback', 'issue', 'extension'),
        allowNull: false,
        defaultValue: 'feedback'
      },

      receiver_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      },

      receiver_type: {
        type: DataTypes.ENUM('admin', 'expert', 'customer'),
        allowNull: true,
        defaultValue: 'admin'
      },

      assigned_to: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },

      status: {
        type: DataTypes.ENUM(
          'active',
          'resolved',
          'investigating',
          'approved',
          'rejected',
          'pending_review'
        ),
        allowNull: false,
        defaultValue: 'pending_review'
      },

      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: true,
        defaultValue: 'medium'
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      requested_extension: {
        type: DataTypes.DATE,
        allowNull: true
      },

      original_deadline: {
        type: DataTypes.DATE,
        allowNull: true
      },

      days_requested: {
        type: DataTypes.INTEGER,
        allowNull: true
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
    },
    {
      sequelize,
      modelName: 'Chat',
      tableName: 'chats',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Chat;
};
