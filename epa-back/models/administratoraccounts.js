'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AdministratorAccounts extends Model {
    static associate(models) {
      AdministratorAccounts.belongsToMany(models.Role, {
        through: models.UserHasRole,
        foreignKey: "user_id",
        otherKey: "role_id",
        as: "roles",
      });
       AdministratorAccounts.hasMany(models.userHasHierarchy, {
    foreignKey: "user_id",
    as: "hierarchies"
  });
   AdministratorAccounts.hasMany(models.UserHasSubCategory, {
    foreignKey: "user_id",
    as: "subcategories"
  });

  
    }
  }
  AdministratorAccounts.init(
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
     isRegional: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
       resetToken :{
        type:DataTypes.STRING(255),
        allowNull:true,
      },
      resetTokenExpiration:{
        type:DataTypes.DATE,
        allowNull:true,
      },
      status: {
       type: DataTypes.BOOLEAN,
       allowNull: false,
       defaultValue: true,
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
      modelName: 'AdministratorAccounts',
      tableName: 'AdministratorAccounts',
      timestamps: false,
    }
  );

  return AdministratorAccounts;
};
