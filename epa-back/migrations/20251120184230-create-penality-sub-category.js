"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PenalitySubCategories", {
      penality_sub_category_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      penalty_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "PenaltyCategories",
          key: "penalty_id",
        },
        onDelete: "CASCADE",
      },
      issue_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
        created_by: {
          type: Sequelize.UUID,
          references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
          type: Sequelize.UUID,
          references: {
          model: 'AdministratorAccounts',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
         created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PenalitySubCategories");
  },
};
