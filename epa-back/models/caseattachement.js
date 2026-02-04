'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CaseAttachement extends Model {

    static associate(models) {

      CaseAttachement.belongsTo(models.Case, {
        foreignKey: 'case_id',
        as: 'case'
      });
      CaseAttachement.belongsTo(models.CaseInvestigation, {
        foreignKey: 'case_investigation_id',
        as: 'case_investigation'
      });
     
      CaseAttachement.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      CaseAttachement.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
    }
  }

  CaseAttachement.init(
    {
      case_attachement_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      case_id: {
        type: DataTypes.UUID,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      case_investigation_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      isFinal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      description:{
        type: DataTypes.STRING,
        allowNull: true
      },
      created_by: {
        type: DataTypes.UUID,
      },
      updated_by: {
        type: DataTypes.UUID,
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
      modelName: 'CaseAttachement',
      tableName: 'CaseAttachements',
      timestamps: false
    }
  );

  return CaseAttachement;
};
  