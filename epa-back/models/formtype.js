'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FormType extends Model {
    static associate(models) {
      FormType.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'created_by',
        as: 'creator',
      });
      FormType.belongsTo(models.AdministratorAccounts, {
        foreignKey: 'updated_by',
        as: 'updater',
      });
    }
  }
  FormType.init({
      form_type_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      form_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
       description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      updated_by: {
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
  }, {
    sequelize,
    modelName: 'FormType',
  });
  return FormType;
};