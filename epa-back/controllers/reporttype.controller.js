const { ReportType, FormType, ReportingForm,SubPollutionCategory } = require("../models");
const { v4: uuidv4 } = require("uuid");

exports.createReportType = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportType:create")) {
      return res.status(403).json({ message: "You do not have permission to create ReportType" });
    }

    const { report_type,sub_pollution_category_id } = req.body;
    if (!report_type) {
      return res.status(400).json({ message: "report_type is required" });
    }

    const newReportType = await ReportType.create({
      report_type_id: uuidv4(),
      report_type,
      sub_pollution_category_id,
      created_by: req.user?.user_id,
    });

    res.status(201).json(newReportType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create ReportType", error });
  }
};

exports.getAllReportTypes = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportType:read")) {
      return res.status(403).json({ message: "You do not have permission to read ReportTypes" });
    }

    const reportTypes = await ReportType.findAll({
      include: [{
        model:SubPollutionCategory,
        as:"sub_pollution_category"
      }]
    });
    res.json(reportTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch ReportTypes", error });
  }
};

exports.getReportTypeById = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportType:read")) {
      return res.status(403).json({ message: "You do not have permission to read ReportType" });
    }

    const { id } = req.params;
    const reportType = await ReportType.findByPk(id,{
       include: [{
        model:SubPollutionCategory,
        as:"sub_pollution_category"
      }]
    });
    if (!reportType) return res.status(404).json({ message: "ReportType not found" });
    res.json(reportType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch ReportType", error });
  }
};

exports.updateReportType = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportType:update")) {
      return res.status(403).json({ message: "You do not have permission to update ReportType" });
    }

    const { id } = req.params;
    const { report_type } = req.body;

    const reportType = await ReportType.findByPk(id);
    if (!reportType) return res.status(404).json({ message: "ReportType not found" });

    reportType.report_type = report_type || reportType.report_type;
    reportType.updated_by = req.user?.user_id;
    reportType.updated_at = new Date();

    await reportType.save();
    res.json(reportType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update ReportType", error });
  }
};

exports.deleteReportType = async (req, res) => {
  try {
    if (!req.user.permissions.includes("reportType:delete")) {
      return res.status(403).json({ message: "You do not have permission to delete ReportType" });
    }

    const { id } = req.params;
    const reportType = await ReportType.findByPk(id);
    if (!reportType) return res.status(404).json({ message: "ReportType not found" });

    await reportType.destroy();
    res.json({ message: "ReportType deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete ReportType", error });
  }
};
