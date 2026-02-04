'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ReportingForms', {
      report_form_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      report_form: {
        type: Sequelize.STRING
      },
      input_type: {
        type: Sequelize.ENUM(
          'text',
          'number',
          'textarea',
          'select',
          'checkbox',
          'radio',
          'date',
          'time',
          'file'
        ),
        allowNull: false,
      },
      options: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      
      required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      form_type_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'FormTypes',
          key: 'form_type_id'
        }
      },
      report_type_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ReportTypes',
          key: 'report_type_id'
        }
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
    await queryInterface.dropTable('ReportingForms');
  }
};