'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ReportSubmissions', {
      report_submission_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      case_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Cases',
          key: 'case_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      penality_sub_category_id: {
        type: Sequelize.UUID,
        references: {
          model: 'PenalitySubCategories',
          key: 'penality_sub_category_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      report_type_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "ReportTypes", key: "report_type_id" }
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ReportSubmissions');
  }
};