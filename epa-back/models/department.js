'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Department extends Model {
    static associate(models) {
      Department.hasMany(models.AdministratorAccounts, {
        foreignKey: 'department_id',
        as: 'administrators',
      });
    }
  }

  Department.init(
    {
      department_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      department_name: {
        type: DataTypes.STRING,
        allowNull: false,
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
       created_by: {
        type: DataTypes.UUID,
        allowNull:true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull:true,
        references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        }
      }
    },
    {
      sequelize,
      modelName: 'Department',
      tableName: 'Departments',
      timestamps: false,
      underscored: true,
    }
  );

  return Department;
};
