'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class userHasHierarchy extends Model {
    static associate(models) {
      this.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'user_id',
        as: 'user'
      });

      this.belongsTo(models.organizationHierarchy, {
        foreignKey: 'organization_hierarchy_id',
        as: 'hierarchy'
      });
    }
  }

  userHasHierarchy.init(
    {
      userHasHierarchy_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      organization_hierarchy_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'organizationHierarchies',
          key: 'organization_hierarchy_id',
        },
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id',
        },
      created_at: {
          type: DataTypes.DATE,
        },

      updated_at: {
          type: DataTypes.DATE,
        },
      },
    },
    {
      sequelize,
      modelName: 'userHasHierarchy',
    }
  );

  return userHasHierarchy;
};
