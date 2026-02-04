const {
  Complaint,
  ComplaintAttachement,
  sequelize,
  Woreda,
  Zone,
  Subcity,
  City,
  Region,
  CustomerAccount,
  AdministratorAccounts,
  PollutionCategory,
  SubPollutionCategory,
  ActivityLog
} = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

const generateReportId = () => {
  return "REP-" + Math.floor(100000 + Math.random() * 900000);
};
exports.createComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      city_id,
      region_id,
      subcity_id,
      actDate,
      actTime,
      location_url,
      detail,
      woreda_id,
      pollution_category_id,
      subpollution_category_id,
      zone_id,
      status,
      specific_address,
    } = req.body;
console.log("req.body",req.body)
    const requiredFields = { pollution_category_id, detail };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    const complaint_id = uuidv4();
    const customer_id = req.user.customer_id || req.user.id;

    const report_id = generateReportId();

    await Complaint.create(
      {
        complaint_id,
        report_id,
        customer_id,
        isGuest: req.user.is_guest,
        region_id: region_id || null,
        city_id: city_id || null,
        subcity_id: subcity_id || null,
        zone_id: zone_id || null,
        woreda_id: woreda_id || null,
        pollution_category_id,
        subpollution_category_id: subpollution_category_id || null,
        detail,
        act_time: actTime || null,
        act_date: actDate || null,
        location_url: location_url || null,
        status: status || "Pending",
        accepted_by: null,
        specific_address,
      },
      { transaction }
    );
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map((file) => ({
        compliant_attachement_id: uuidv4(),
        complaint_id,
        file_path: file.path,
        file_name: file.originalname,
      }));

      await ComplaintAttachement.bulkCreate(attachments, { transaction });
    }


    if (req.user.is_guest) {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: req.user.email,
        subject: "EPA Complaint Submitted Successfully",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Hello,</p>
            <p>Your environmental pollution report has been submitted successfully.</p>
            <p><strong>Report ID:</strong></p>
            <h2 style="color:#2E86C1;">${report_id}</h2>
            <p>Please keep this Report ID for tracking and future communication.</p>
            <p>Thank you for helping protect the environment.</p>
            <p><strong>EPA Team</strong></p>
          </div>
        `,
      });

      return res.status(201).json({
        success: true,
        message:
          "Complaint submitted successfully. The report ID has been sent to your email.",
      });
    }
    await transaction.commit();

    return res.status(201).json({
      success: true,
      report_id,
      message: "Complaint created successfully",
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error creating complaint:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create complaint",
    });
  }
};


exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [
        { model: ComplaintAttachement, as: "attachments" },
        { model: Woreda, as: "woreda" },
        { model: Zone, as: "zone" },
        { model: Subcity, as: "subcity" },
        { model: City, as: "city" },
        { model: Region, as: "region" },
        { model: CustomerAccount, as: "customer" },
         { model: AdministratorAccounts, as: "acceptedBy" },
        { model: PollutionCategory, as: "pollution_category" },
        { model: SubPollutionCategory, as: "sub_pollution_category" },
      ],
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const { complaint_id } = req.params;
  if (!complaint_id) {
    return res.status(400).json({ success: false, message: "complaint_id is required" });
  }
  
    const complaint = await Complaint.findOne({
      where: { complaint_id: complaint_id },
  include: [
        { model: ComplaintAttachement, as: "attachments" },
        { model: Woreda, as: "woreda" },
        { model: Zone, as: "zone" },
        { model: Subcity, as: "subcity" },
        { model: City, as: "city" },
        { model: Region, as: "region" },
        { model: CustomerAccount, as: "customer" },
         { model: AdministratorAccounts, as: "acceptedBy" },
        { model: PollutionCategory, as: "pollution_category" },
        { model: SubPollutionCategory, as: "sub_pollution_category" },
       {
          model: ActivityLog,
          as: "activity_logs",
          attributes: ["new_status", "created_at"],
          where: {
            entity_type: "Complaint",
            entity_id: complaint_id,
            new_status: {
              [Op.in]: [
                "Under Review",
                "Verified",
                "under_investigation",
                "Rejected",
                "Closed",
              ],
            },
          },
          required: false,
          order: [["created_at", "DESC"]],
        },
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint",
      error: error.message,
    });
  }
};

exports.getComplaintByReportId = async (req, res) => {
  try {
    const { report_id } = req.params;
    if (!report_id) {
      return res.status(400).json({ success: false, message: "report_id is required" });
    }

    // 1️⃣ Fetch complaint
    const complaint = await Complaint.findOne({
      where: { report_id },
      include: [
        { model: ComplaintAttachement, as: "attachments" },
        { model: Woreda, as: "woreda" },
        { model: Zone, as: "zone" },
        { model: Subcity, as: "subcity" },
        { model: City, as: "city" },
        { model: Region, as: "region" },
        { model: CustomerAccount, as: "customer" },
        { model: AdministratorAccounts, as: "acceptedBy" },
        { model: PollutionCategory, as: "pollution_category" },
        { model: SubPollutionCategory, as: "sub_pollution_category" },
      ],
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // 2️⃣ Fetch activity logs for this complaint only
    const activity_logs = await ActivityLog.findAll({
      where: {
        entity_type: "Complaint",
        entity_id: complaint.complaint_id,
        new_status: {
          [Op.in]: ["Under Review", "Verified", "under_investigation", "Rejected", "Closed"],
        },
      },
      attributes: ["new_status", "created_at"],
      order: [["created_at", "DESC"]],
    });

    // 3️⃣ Attach activity logs to complaint
    const complaintWithLogs = {
      ...complaint.toJSON(),
      activity_logs,
    };

    return res.status(200).json({
      success: true,
      data: complaintWithLogs,
    });

  } catch (error) {
    console.error("Error fetching complaint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint",
      error: error.message,
    });
  }
};

exports.getComplaintByCustomerId = async (req, res) => {
  try {
    const { customer_id } = req.params;
  if (!customer_id) {
    return res.status(400).json({ success: false, message: "customer_id is required" });
  }

      let complaint = await Complaint.findAll({
      where: { customer_id: customer_id},
      include: [
        { model: ComplaintAttachement, as: "attachments" },
        { model: Woreda, as: "woreda" },
        { model: Zone, as: "zone" },
        { model: Subcity, as: "subcity" },
        { model: City, as: "city" },
        { model: Region, as: "region" },
        { model: CustomerAccount, as: "customer" },
        { model: AdministratorAccounts, as: "acceptedBy" },
        { model: PollutionCategory, as: "pollution_category" },
        { model: SubPollutionCategory, as: "sub_pollution_category" },
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint",
      error: error.message,
    });
  }
};

exports.updateComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { complaint_id } = req.params;
  if (!complaint_id) {
    return res.status(400).json({ success: false, message: "complaint_id is required" });
  }
    const body = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [key, value === "" ? null : value])
    );

    const {
      city_id,
      region_id,
      subcity_id,
      location_url,
      detail,
      woreda_id,
      zone_id,
      pollution_category_id,
      subpollution_category_id,
      status,
      actDate,
      actTime,
      accepted_by,
    } = body;

    const complaint = await Complaint.findOne({ where: { complaint_id: complaint_id } });
    if (!complaint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    await complaint.update(
      {
        city_id: city_id ?? complaint.city_id,
        region_id: region_id ?? complaint.region_id,
        subcity_id: subcity_id ?? complaint.subcity_id,
        woreda_id: woreda_id ?? complaint.woreda_id,
        zone_id: zone_id ?? complaint.zone_id,
        pollution_category_id: pollution_category_id ?? complaint.pollution_category_id,
        subpollution_category_id: subpollution_category_id ?? complaint.subpollution_category_id,
        location_url: location_url ?? complaint.location_url,
        detail: detail ?? complaint.detail,
        act_date: actDate ?? complaint.actDate,
        act_time: actTime ?? complaint.actTime,
        status: status ?? complaint.status,
        accepted_by: accepted_by ?? complaint.accepted_by,
      },
      { transaction }
    );

    if (req.file) {
      await ComplaintAttachement.destroy({ where: { complaint_id: complaint_id }, transaction });
      await ComplaintAttachement.create(
        {
          compliant_attachement_id: uuidv4(),
          complaint_id: complaint_id,
          file_path: req.file.path,
          file_name: req.file.originalname,
        },
        { transaction }
      );
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating complaint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update complaint",
      error: error.message,
    });
  }
};

exports.deleteComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { complaint_id } = req.params;
  if (!complaint_id) {
    return res.status(400).json({ success: false, message: "complaint_id is required" });
  }
    const complaint = await Complaint.findOne({ where: { complaint_id: complaint_id } });
    if (!complaint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    await ComplaintAttachement.destroy({
      where: { complaint_id: complaint_id },
      transaction,
    });

    await Complaint.destroy({
      where: { complaint_id: complaint_id },
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting complaint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete complaint",
      error: error.message,
    });
  }
};
