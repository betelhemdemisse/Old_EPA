"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class organizationHierarchy extends Model {
    static associate(models) {
      organizationHierarchy.belongsTo(models.Region, {
        foreignKey: "region_id",
        as: "region",
      });
      organizationHierarchy.belongsTo(models.City, {
        foreignKey: "city_id",
        as: "city",
      });
      organizationHierarchy.belongsTo(models.Subcity, {
        foreignKey: "subcity_id",
        as: "subcity",
      });
      organizationHierarchy.belongsTo(models.Zone, {
        foreignKey: "zone_id",
        as: "zone",
      });
      organizationHierarchy.belongsTo(models.Woreda, {
        foreignKey: "woreda_id",
        as: "woreda",
      });

      organizationHierarchy.belongsTo(models.organizationHierarchy, {
        foreignKey: "parent_id",
        as: "parent",
      });

      organizationHierarchy.hasMany(models.organizationHierarchy, {
        foreignKey: "parent_id",
        as: "children",
      });

      organizationHierarchy.hasMany(models.userHasHierarchy, {
        foreignKey: "organization_hierarchy_id",
        as: "userHasHierarchy",
      });
    }
  }

  organizationHierarchy.init(
    {
      organization_hierarchy_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "organizationHierarchies",
          key: "organization_hierarchy_id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      hierarchy_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      region_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      city_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      isRegional: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
   
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AdministratorAccounts",
          key: "user_id",
        },
      },

      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AdministratorAccounts",
          key: "user_id",
        },
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
      modelName: "organizationHierarchy",
      tableName: "organizationHierarchies",
      timestamps: false,
      underscored: true,
    }
  );

  return organizationHierarchy;
};
