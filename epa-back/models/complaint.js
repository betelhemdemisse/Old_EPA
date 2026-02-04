"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Complaint extends Model {
    static associate(models) {
      if (models.Region) {
        Complaint.belongsTo(models.Region, {
          foreignKey: "region_id",
          as: "region",
        });
      }
      if (models.Chat){
        Complaint.hasMany(models.Chat,{
          foreignKey:"complaint_id",
          as:"chat"
        });
      }
      if (models.RejectionReason) {
        Complaint.belongsTo(models.RejectionReason, {
          foreignKey: "rejection_reason_id",
          as: "rejection_reason",
        });
      }
      if (models.ComplaintAttachement) {
        Complaint.hasMany(models.ComplaintAttachement, {
          foreignKey: "complaint_id",
          as: "attachments",
        });
      }

      if (models.CustomerAccount) {
        Complaint.belongsTo(models.CustomerAccount, {
          foreignKey: "customer_id",
          as: "customer",
        });
      }

      if (models.City) {
        Complaint.belongsTo(models.City, {
          foreignKey: "city_id",
          as: "city",
        });
      }

      if (models.Subcity) {
        Complaint.belongsTo(models.Subcity, {
          foreignKey: "subcity_id",
          as: "subcity",
        });
      }

      if (models.Zone) {
        Complaint.belongsTo(models.Zone, {
          foreignKey: "zone_id",
          as: "zone",
        });
      }

      if (models.Woreda) {
        Complaint.belongsTo(models.Woreda, {
          foreignKey: "woreda_id",
          as: "woreda",
        });
      }

      if (models.PollutionCategory) {
        Complaint.belongsTo(models.PollutionCategory, {
          foreignKey: "pollution_category_id",
          as: "pollution_category",
        });
      }

      if (models.SubPollutionCategory) {
        Complaint.belongsTo(models.SubPollutionCategory, {
          foreignKey: "subpollution_category_id",
          as: "sub_pollution_category",
        });
      }
      if (models.AdministratorAccounts) {
        Complaint.belongsTo(models.AdministratorAccounts, {
          foreignKey: "user_id",
          as: "acceptedBy",
        });
      }

      // if (models.Case) {
      Complaint.hasOne(models.Case, {
        foreignKey: "complaint_id",
        as: "case",
      });
      Complaint.hasMany(models.ActivityLog, {
        foreignKey: "entity_id",
        constraints: false,
        scope: { entity_type: "Complaint" },
        as: "activity_logs",
      });

      // }
    }
  }

  Complaint.init(
    {
      complaint_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      report_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      region_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      city_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      subcity_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      zone_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      woreda_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      pollution_category_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subpollution_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      detail: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      specific_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rejection_reason_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "RejectionReasons",
          key: "rejection_reason_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // rejection_description: {
      //   type: DataTypes.TEXT,
      //   allowNull: true,
      // },
      // rejected_at: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      // },
      // rejected_by: {
      //   type: DataTypes.UUID,
      //   allowNull: true,
      //   references: {
      //     model: 'AdministratorAccounts',
      //     key: 'user_id',
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL',
      // },
      customer_otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isGuest: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_Team_Formation_needed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      handling_unit: {
        type: DataTypes.ENUM("temporary_team", "regional_team", "hq_expert"),
        allowNull: true,
      },
     
      act_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      act_time: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      noise_area: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      noise_area_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accepted_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Complaint",
      tableName: "Complaint",
      timestamps: false,
      underscored: true,
    }
  );

  return Complaint;
};
