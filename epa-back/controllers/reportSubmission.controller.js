const { ReportingForm,ClosingAttachement,TeamCase,ExpertCase,ActivityLog,Complaint, FormType,Case, ReportType, ReportSubmissions, ReportSubmissionValues, AdministratorAccounts } = require("../models");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const { include } = require("underscore");

exports.getReportForm = async (req, res) => {
  try {
    const { report_type_id } = req.params;

    if (!report_type_id) {
      return res.status(400).json({ message: "report_type_id is required" });
    }
const reportType = await ReportType.findByPk(report_type_id, {
  include: [
    {
      model: ReportingForm,
      as: "reportingForm",
      include: [
        { model: FormType, as: "formType" } 
      ]
    }
  ]
});


    if (!reportType) return res.status(404).json({ message: "Report type not found" });

    res.json({ status: true, data: reportType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

exports.submitReportForm = async (req, res) => {
  const transaction = await ReportSubmissions.sequelize.transaction();

  try {
    const userId = req.user?.id;
    const permissions = req.user?.permissions || [];

    const { report_type_id, case_id, penality_sub_category_id } = req.body;

    // Parse values from FormData (sent as JSON string)
    let values = [];
    if (req.body.values) {
      try {
        values = JSON.parse(req.body.values);
      } catch (err) {
        return res.status(400).json({ message: "Invalid JSON for values" });
      }
    }

    if (!report_type_id) {
      return res.status(400).json({ message: "report_type_id is required" });
    }

    if (!Array.isArray(values)) {
      return res.status(400).json({ message: "values must be an array" });
    }

    /* ------------------------------------------------
     * Create report submission
     * ------------------------------------------------ */
    const submission = await ReportSubmissions.create(
      {
        report_submission_id: uuidv4(),
        report_type_id,
        penality_sub_category_id: penality_sub_category_id || null,
        case_id: case_id || null,
        created_by: userId,
        updated_by: userId,
      },
      { transaction }
    );

    /* ------------------------------------------------
     * Create submission values
     * ------------------------------------------------ */
    const submissionValues = values.map(v => ({
      report_submission_value_id: uuidv4(),
      report_submission_id: submission.report_submission_id,
      report_form_id: v.report_form_id,
      value: v.value,
      created_by: userId,
      updated_by: userId,
    }));

    await ReportSubmissionValues.bulkCreate(submissionValues, { transaction });

    /* ------------------------------------------------
     * Resolve case (ExpertCase or TeamCase)
     * ------------------------------------------------ */
    let caseData;

    const expertCase = await ExpertCase.findOne({
      where: { case_id, user_id: userId },
      include: [{ model: Case, as: "case" }],
      transaction,
    });

    if (expertCase?.case) {
      if (!permissions.includes("expert:can-upload-investigation")) {
        return res.status(403).json({
          status: false,
          message: "You do not have permission to submit this report",
        });
      }
      caseData = expertCase.case;
    } else {
      const teamCase = await TeamCase.findOne({
        where: { case_id, user_id: userId },
        include: [{ model: Case, as: "case" }],
        transaction,
      });

      if (!teamCase?.case) {
        return res.status(404).json({
          status: false,
          message: "Case not found or not assigned to this user",
        });
      }

      if (!permissions.includes("teamLead:can-upload-investigation")) {
        return res.status(403).json({
          status: false,
          message: "You do not have permission to submit this report",
        });
      }

      caseData = teamCase.case;
    }

    /* ------------------------------------------------
     * Update case & complaint status
     * ------------------------------------------------ */
    const oldStatus = caseData.status;

    await caseData.update(
      { status: "investigation_submitted", updated_by: userId },
      { transaction }
    );

    const complaint = await Complaint.findOne({
      include: [{ model: Case, as: "case", where: { case_id } }],
      transaction,
    });

    if (complaint) {
      complaint.status = "investigation_submitted";
      await complaint.save({ transaction });
    }
    /* ------------------------------------------------
     * Save closing attachments (if any)
     * ------------------------------------------------ */
    if (req.files?.length) {
      const attachments = req.files.map(file => ({
        closing_attachement_id: uuidv4(),
        case_id,
        file_path: file.path,
        file_name: file.filename,
        created_by: userId,
        updated_by: userId,
      }));

      await ClosingAttachement.bulkCreate(attachments, { transaction });
    }

    /* ------------------------------------------------
     * Activity log
     * ------------------------------------------------ */
    await ActivityLog.create(
      {
        user_id: userId,
        entity_type: "Case",
        entity_id: case_id,
        old_status: oldStatus,
        new_status: "investigation_submitted",
        description: `Final investigation submitted by user ${userId}`,
      },
      { transaction }
    );

    await transaction.commit();

    return res.json({
      status: true,
      message: "Report submitted successfully",
      data: submission,
      attachments: req.files?.length || 0,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Submit Report Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};


exports.getReportSubmissions = async (req, res) => {
  try {
    const { case_id } = req.params;

    if (!case_id) {
      return res.status(400).json({ status: false, message: "case_id is required" });
    }

    const submission = await ReportSubmissions.findOne({
      where: { case_id },
      include: [
        { 
          model: ReportSubmissionValues, 
          as: "values",
          include: [
            { 
              model: ReportingForm, 
              as: "form",
              include: [{ model: FormType, as: "formType" }] 
            }
          ]
        },
        { model: AdministratorAccounts, as: "creator", attributes: ["name", "email"] },
        { model: ReportType, as: "reportType" },
        { model: Case, as: "case",include:[{model:ClosingAttachement,as:"closingAttachement"}] }
      ],
      order: [["created_at", "DESC"]]
    });

    if (!submission) {
      return res.status(404).json({ status: false, message: "No submission found for this case" });
    }

    res.json({ status: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};
