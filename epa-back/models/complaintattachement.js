'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ComplaintAttachement extends Model {
    static associate(models) {
      ComplaintAttachement.belongsTo(models.Complaint, {
        foreignKey: 'complaint_id',
        as: 'attachments'
      });

    }
  }

  ComplaintAttachement.init(
    {
      compliant_attachement_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      complaint_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      },

      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'ComplaintAttachement',
      tableName: 'ComplaintAttachement',
      timestamps: false,
      underscored: true,
    }
  );

  return ComplaintAttachement;
};
