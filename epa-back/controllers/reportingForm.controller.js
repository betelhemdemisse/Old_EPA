const { ReportingForm, FormType, ReportType } = require("../models");
const { v4: uuidv4 } = require("uuid");

exports.createReportingForm = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportForm:create")) {
      return res.status(403).json({ message: "You do not have permission to create ReportingForm" });
    }

    const { report_form, input_type, options, required, form_type_id, report_type_id } = req.body;

    if (!report_form || !input_type || !form_type_id || !report_type_id) {
      return res.status(400).json({ message: "report_form, input_type, form_type_id, report_type_id are required" });
    }

    const newForm = await ReportingForm.create({
      report_form_id: uuidv4(),
      report_form,
      input_type,
      options,
      required: required || false,
      form_type_id,
      report_type_id,
      created_by: req.user?.user_id,
    });

    res.status(201).json(newForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create ReportingForm", error });
  }
};

exports.getAllReportingForms = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportForm:read")) {
      return res.status(403).json({ message: "You do not have permission to read ReportingForms" });
    }

    const { form_type_id, report_type_id } = req.query;
    const whereClause = {};
    if (form_type_id) whereClause.form_type_id = form_type_id;
    if (report_type_id) whereClause.report_type_id = report_type_id;

    const forms = await ReportingForm.findAll({
      where: whereClause,
      include: [
        { model: FormType, as: "formType" },
        { model: ReportType, as: "reportType" }
      ],
    });

    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch ReportingForms", error });
  }
};

exports.getReportingFormById = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportForm:read")) {
      return res.status(403).json({ message: "You do not have permission to read ReportingForm" });
    }

    const { id } = req.params;

    const form = await ReportingForm.findByPk(id, {
      include: [
        { model: FormType, as: "formType" },
        { model: ReportType, as: "reportType" },
      ],
    });

    if (!form) return res.status(404).json({ message: "ReportingForm not found" });

    res.json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch ReportingForm", error });
  }
};

exports.updateReportingForm = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportForm:update")) {
      return res.status(403).json({ message: "You do not have permission to update ReportingForm" });
    }

    const { id } = req.params;
    const { report_form, input_type, options, required, form_type_id, report_type_id } = req.body;

    const form = await ReportingForm.findByPk(id);
    if (!form) return res.status(404).json({ message: "ReportingForm not found" });

    form.report_form = report_form || form.report_form;
    form.input_type = input_type || form.input_type;
    form.options = options || form.options;
    form.required = required ?? form.required;
    form.form_type_id = form_type_id || form.form_type_id;
    form.report_type_id = report_type_id || form.report_type_id;
    form.updated_by = req.user?.user_id;
    form.updated_at = new Date();

    await form.save();
    res.json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update ReportingForm", error });
  }
};

exports.deleteReportingForm = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportForm:delete")) {
      return res.status(403).json({ message: "You do not have permission to delete ReportingForm" });
    }

    const { id } = req.params;

    const form = await ReportingForm.findByPk(id);
    if (!form) return res.status(404).json({ message: "ReportingForm not found" });

    await form.destroy();
    res.json({ message: "ReportingForm deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete ReportingForm", error });
  }
};
