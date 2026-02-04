'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Case extends Model {
    static associate(models) {

      Case.belongsTo(models.Complaint, {
        foreignKey: 'complaint_id',
        as: 'complaint'
      });


      Case.belongsTo(models.AdministratorAccounts, {
        as: 'statusChanger',
        foreignKey: 'status_changed_by'
      });

      Case.belongsTo(models.AdministratorAccounts, {
        as: 'extender',
        foreignKey: 'extended_by'
      });

      Case.belongsTo(models.AdministratorAccounts, {
        as: 'creator',
        foreignKey: 'created_by'
      });
      Case.hasMany(models.CaseInvestigation, {
        as: 'case_investigation',
        foreignKey: 'case_id'
      });
      Case.hasMany(models.ClosingAttachement, {
        as: 'closingAttachement',
        foreignKey: 'case_id'
      });
     Case.hasOne(models.ExpertCase, {
        as: 'expertCase',
        foreignKey: 'case_id'
      });
       Case.hasOne(models.ReportSubmissions, {
        as: 'reportSubmissions',
        foreignKey: 'case_id'
      });
      Case.hasMany(models.TeamCase, {
        as: 'teamCase',
        foreignKey: 'case_id'
      });
        Case.hasMany(models.CaseHasReturn, {
        as: 'caseHasReturn',
        foreignKey: 'case_id'
      });
      
      Case.hasMany(models.CaseAttachement, {
        as: 'case_attachement',
        foreignKey: 'case_id'
      });
Case.hasMany(models.ActivityLog, {
  foreignKey: 'entity_id',
  constraints: false,
  scope: { entity_type: 'Case' },
  as: 'activity_logs',
});

    }
  }

  Case.init(
    {
      case_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      case_no: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      complaint_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      status: {
        type: DataTypes.STRING
      },

      status_changed_by: {
        type: DataTypes.UUID,
      },
      reminder_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },

      countdown_end_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      extended_days: {
        type: DataTypes.STRING
      },

      is_extended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },

      extended_by: {
        type: DataTypes.UUID,
      },
      countdown_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
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
      is_opened: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Case',
      tableName: 'Cases',
      timestamps: false
    }
  );

  return Case;
};
