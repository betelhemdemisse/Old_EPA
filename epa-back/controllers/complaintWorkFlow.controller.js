const { include } = require("underscore");
const {
  Complaint,
  ComplaintAttachement,
  sequelize,
 ReportSubmissions,
  organizationHierarchy,
  Woreda,
  Zone,
  RejectionReason,
  Subcity,
  City,
  CaseInvestigation,
  PenalitySubCategory,
  Case,
  Region,
  userHasHierarchy,
  CustomerAccount,
  CaseAttachement,
  AdministratorAccounts,
  PollutionCategory,
  SubPollutionCategory,
  ActivityLog,
  ExpertCase,
  Role,
  ClosingAttachement,
  UserHasRole,
  RoleHasPermission, Permission,
  TeamCase,
CaseHasReturn,
  Sequelize
} = require("../models");
const { sendRealtimeNotification } = require("../socket");
const { calculateRemainingDays } = require('../utils/caseUtils');

const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
function getAttachmentType(filename) {
  if (!filename) return "unknown";

  const ext = filename.split(".").pop().toLowerCase();

  const image = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const video = ["mp4", "avi", "mov", "wmv", "mkv"];
  const audio = ["mp3", "wav", "aac", "m4a", "ogg"];
  const document = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];

  if (image.includes(ext)) return "image";
  if (video.includes(ext)) return "video";
  if (audio.includes(ext)) return "audio";
  if (document.includes(ext)) return "document";

  return "unknown";
}

exports.getComplaintForTaskForce = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const expert_id = req.user.id;

    if (!req.user.permissions.includes("taskForce:can-get-complaint")) {
      return res.status(403).json({ success: false, message: "You do not have permission" });
    }

    const pendingCount = await Complaint.count({
      where: { status: "Pending", accepted_by: null },
    });

    let complaint = await Complaint.findOne({
      where: { status: "Pending", accepted_by: null },
      order: [["created_at", "ASC"]],
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
      transaction: t,
    });

    if (!complaint) {
      await t.rollback();
      return res.status(200).json({
        success: true,
        message: "No new complaints available",
        complaint: null,
        pending_count: pendingCount, // Add pending count
      });
    }

    await complaint.update(
      { 
        accepted_by: expert_id,
        status: "Under Review"
      },
      { transaction: t }
    );

    // Log activity
   await ActivityLog.create(
  {
    user_id: expert_id,
    entity_type: "Complaint",
    entity_id: complaint.complaint_id,
    old_status: "Pending",
    new_status: "Under Review",
    description: `Complaint assigned to taskforce expert with ID ${expert_id}`,
  },
  { transaction: t }
);


    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Complaint assigned and moved to Under Review",
      complaint,
      pending_count: pendingCount, // Add pending count
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while assigning the complaint",
      error: error.message,
    });
  }
};

exports.authorizeComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {

    // if (!req.user.permissions.includes("deputyDirector:read")) {
    //   return res.status(403).json({ 
    //     success: false,
    //     message: "You do not have permission" 
    //   });
    // }
    
    const { complaint_id } = req.params;

    const complaint = await Complaint.findByPk(complaint_id, { transaction });

    if (!complaint) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: "Complaint not found" 
      });
    }

    if (complaint.status === "authorized") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Complaint is already authorized"
      });
    }

    if (complaint.status !== "investigation_submitted") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Complaint cannot be authorized. Current complaint status is: ${complaint.status}. Complaint must be investigation submitted to be authorized.`
      });
    }

    const associatedCase = await Case.findOne({
      where: { complaint_id: complaint.complaint_id },
      transaction
    });

    if (!associatedCase) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Cannot authorize complaint: No case found associated with this complaint"
      });
    }

    if (associatedCase.status !== "investigation_submitted") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot authorize complaint. Case status must be "investigation_submitted". Current case status is: ${associatedCase.status}`
      });
    }

    const finalInvestigation = await CaseInvestigation.findOne({
      where: { 
        case_id: associatedCase.case_id,
        status: "final" 
      },
      transaction
    });

    if (!finalInvestigation) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Cannot authorize complaint: No final investigation report submitted"
      });
    }

    const old_status = complaint.status;
    complaint.status = "authorized";
    await complaint.save({ transaction });

    const oldCaseStatus = associatedCase.status;
    associatedCase.status = "Authorized";
    await associatedCase.save({ transaction });

    await ActivityLog.create(
      {
        user_id: req.user.id,
        entity_type: "Case",
        entity_id: associatedCase.case_id,
        old_status: oldCaseStatus,
        new_status: associatedCase.status,
        description: `Case authorized for complaint ${complaint.report_id}`,
      },
      { transaction }
    );

    await ActivityLog.create(
      {
        user_id: req.user.id,
        entity_type: "Complaint",
        entity_id: complaint.complaint_id,
        old_status,
        new_status: complaint.status,
        description: `Complaint authorized by deputy director after investigation submission`,
      },
      { transaction }
    );

    if (complaint.customer_id) { 
      sendRealtimeNotification(complaint.customer_id, {
        complaintId: complaint.report_id,
        status: complaint.status,
        message: `Your complaint has been authorized. Report No: ${complaint.report_id}`,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Complaint authorized successfully",
      data: {
        complaint_id: complaint.complaint_id,
        report_id: complaint.report_id,
        status: complaint.status,
        case_id: associatedCase.case_id,
        case_status: associatedCase.status,
        old_status: old_status
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("authorizeComplaint error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.rejectComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {

  

    const { complaint_id } = req.params;
    const { reason_id, description } = req.body;


    // Validate required fields
    if (!reason_id || reason_id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    if (!description || description.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection description is required"
      });
    }

    // Verify the rejection reason exists
    const rejectionReason = await RejectionReason.findByPk(reason_id, { transaction });
    if (!rejectionReason) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Rejection reason not found"
      });
    }

    // Find the complaint
    const complaint = await Complaint.findByPk(complaint_id, { transaction });

    if (!complaint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // Check if complaint is already rejected
    if (complaint.status === "Rejected") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Complaint is already rejected"
      });
    }

    // Validate complaint status for rejection
    const allowedStatuses = ["Under Review", "Pending"];
    if (!allowedStatuses.includes(complaint.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Complaint cannot be rejected. Current status is: ${complaint.status}. Complaint must be in "Under Review" or "Pending" status to be rejected.`
      });
    }

    // Store old status
    const oldStatus = complaint.status;

    // Update complaint with rejection details
    complaint.status = "Rejected";
    complaint.rejection_reason_id = reason_id;
    complaint.rejection_description = description;
    complaint.rejected_at = new Date();
    complaint.rejected_by = req.user.id;
    
    await complaint.save({ transaction });

    // Update associated case if exists
    let associatedCase = null;
    let caseActivityLog = null;
    
    const caseRecord = await Case.findOne({
      where: { complaint_id: complaint.complaint_id },
      transaction
    });

    if (caseRecord) {
      const oldCaseStatus = caseRecord.status;
      caseRecord.status = "Rejected";
      await caseRecord.save({ transaction });

      // Create activity log for case
      caseActivityLog = await ActivityLog.create(
        {
          user_id: req.user.id,
          entity_type: "Case",
          entity_id: caseRecord.case_id,
          old_status: oldCaseStatus,
          new_status: caseRecord.status,
          description: `Case rejected for complaint ${complaint.report_id}. Reason: ${rejectionReason.reason}`,
          rejection_reason_id: reason_id,
        },
        { transaction }
      );
    }

    // Create activity log for complaint
    const complaintActivityLog = await ActivityLog.create(
      {
        user_id: req.user.id,
        entity_type: "Complaint",
        entity_id: complaint.complaint_id,
        old_status: oldStatus,
        new_status: complaint.status,
        description: `Complaint rejected by ${req.user.name || req.user.email}. Reason: ${rejectionReason.reason}. Details: ${description}`,
        rejection_reason_id: reason_id,
      },
      { transaction }
    );

    // Send notification to customer if exists
    if (complaint.customer_id) {
      sendRealtimeNotification(complaint.customer_id, {
        complaintId: complaint.report_id,
        status: complaint.status,
        message: `Your complaint has been rejected. Report No: ${complaint.report_id}. Reason: ${rejectionReason.reason}`,
      });
    }

    await transaction.commit();

    // Fetch the updated complaint with rejection reason
    const updatedComplaint = await Complaint.findByPk(complaint_id, {
      include: [
        {
          model: RejectionReason,
          as: 'rejection_reason',
          attributes: ['rejection_reason_id', 'reason', 'description']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Complaint rejected successfully",
      data: {
        complaint: {
          complaint_id: updatedComplaint.complaint_id,
          report_id: updatedComplaint.report_id,
          status: updatedComplaint.status,
          rejection_reason_id: updatedComplaint.rejection_reason_id,
          rejection_description: updatedComplaint.rejection_description,
          rejected_at: updatedComplaint.rejected_at,
          rejected_by: updatedComplaint.rejected_by,
          rejection_reason: updatedComplaint.rejection_reason
        },
        case: caseRecord ? {
          case_id: caseRecord.case_id,
          status: caseRecord.status
        } : null,
        activity_logs: {
          complaint: {
            activity_log_id: complaintActivityLog.activity_log_id,
            description: complaintActivityLog.description,
            created_at: complaintActivityLog.created_at
          },
          case: caseActivityLog ? {
            activity_log_id: caseActivityLog.activity_log_id,
            description: caseActivityLog.description,
            created_at: caseActivityLog.created_at
          } : null
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("rejectComplaint error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


exports.closeComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    if (!req.user.permissions.includes("taskForce:can-get-complaint")) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission",
      });
    }

    const { complaint_id } = req.params;
    const { description } = req.body;
    const files = req.files || [];

    const complaint = await Complaint.findByPk(complaint_id, { transaction });
    if (!complaint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.status === "closed") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Complaint is already closed",
      });
    }

    const associatedCase = await Case.findOne({
      where: { complaint_id: complaint.complaint_id },
      transaction,
    });

    if (!associatedCase) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "No case found for this complaint",
      });
    }

    /* =========================
       Status Validation
    ========================== */
    const isTemporaryTeam =
      (complaint.handling_unit || "").trim().toLowerCase() === "temporary_team";

    const caseStatus = (associatedCase.status || "").toLowerCase();
    const allowedStatuses = isTemporaryTeam
      ? ["investigation_submitted", "authorized"]
      : ["authorized"];

    if (!allowedStatuses.includes(caseStatus)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Case is not in a closable state",
      });
    }

    const finalInvestigation = await CaseInvestigation.findOne({
      where: { case_id: associatedCase.case_id, status: "final" },
      transaction,
    });

    if (!finalInvestigation) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Final investigation report not submitted",
      });
    }

    /* =========================
       Close Complaint & Case
    ========================== */
    const oldComplaintStatus = complaint.status;
    const oldCaseStatus = associatedCase.status;

    complaint.status = "closed";
    associatedCase.status = "Closed";

    await Promise.all([
      complaint.save({ transaction }),
      associatedCase.save({ transaction }),
    ]);

    /* =========================
       Save Closing Attachments
    ========================== */
    if (files.length > 0) {
      const closingAttachments = files.map(file => ({
        case_id: associatedCase.case_id,
        file_path: file.path,
        file_name: file.originalname,
        description: description || null,
        created_by: req.user.id,
        updated_by: req.user.id,
      }));

      await ClosingAttachement.bulkCreate(
        closingAttachments,
        { transaction }
      );
    }

    /* =========================
       Logs
    ========================== */
    await ActivityLog.bulkCreate(
      [
        {
          user_id: req.user.id,
          entity_type: "Case",
          entity_id: associatedCase.case_id,
          old_status: oldCaseStatus,
          new_status: associatedCase.status,
          description: `Case closed for complaint ${complaint.report_id}`,
        },
        {
          user_id: req.user.id,
          entity_type: "Complaint",
          entity_id: complaint.complaint_id,
          old_status: oldComplaintStatus,
          new_status: complaint.status,
          description: "Complaint closed by task force",
        },
      ],
      { transaction }
    );

    if (complaint.customer_id) {
      sendRealtimeNotification(complaint.customer_id, {
        complaintId: complaint.report_id,
        status: complaint.status,
        message: `Your complaint has been closed`,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Complaint closed successfully",
    });

  } catch (error) {
    await transaction.rollback();
    console.error("closeComplaint error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.returnComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { complaint_id } = req.params;
    const { return_reason } = req.body;

    // 1️⃣ Validate input
    if (!return_reason || return_reason.trim() === "") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Return reason is required",
      });
    }

    const complaint = await Complaint.findOne({
      where: { complaint_id },
      include: [
        {
          model: Case,
          as: "case",
          required: true, 
        },
      ],
      transaction,
    });

    if (!complaint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.status === "returned") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Complaint is already returned",
      });
    }

    // 3️⃣ Update complaint
    const oldComplaintStatus = complaint.status;
    await Complaint.update(
      { status: "returned" },
      { where: { complaint_id }, transaction }
    );

    // 4️⃣ Update case
    const oldCaseStatus = complaint.case.status;
    await Case.update(
      { status: "Returned" },
      { where: { case_id: complaint.case.case_id }, transaction }
    );

    // 5️⃣ Update investigation(s) safely (hasOne / hasMany)
   

    // 6️⃣ Activity logs
    await ActivityLog.create(
      {
        user_id: req.user.id,
        entity_type: "Complaint",
        entity_id: complaint.complaint_id,
        old_status: oldComplaintStatus,
        new_status: "returned",
        description: `Complaint returned by deputy director. Reason: ${return_reason}`,
      },
      { transaction }
    );

    await ActivityLog.create(
      {
        user_id: req.user.id,
        entity_type: "Case",
        entity_id: complaint.case.case_id,
        old_status: oldCaseStatus,
        new_status: "Returned",
        description: `Case returned for complaint ${complaint.report_id}. Reason: ${return_reason}`,
      },
      { transaction }
    );

    // 7️⃣ Notify customer
    if (complaint.customer_id) {
      sendRealtimeNotification(complaint.customer_id, {
        complaintId: complaint.report_id,
        status: "returned",
        message: `Your complaint has been returned. Report No: ${complaint.report_id}. Reason: ${return_reason}`,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Complaint returned successfully",
      data: {
        complaint_id: complaint.complaint_id,
        report_id: complaint.report_id,
        status: "returned",
        old_status: oldComplaintStatus,
        case_id: complaint.case.case_id,
        case_status: "Returned",
        return_reason,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("returnComplaint error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


exports.getAllComplaintForDuptyDirector = async (req, res) => {
  try {
    if (!req.user.permissions.includes("deputyDirector:read")) {
      return res.status(403).json({ message: "You do not have permission" });
    }

    const { status } = req.query;

    // 1️⃣ Get user's assigned hierarchies
    const userHierarchies = await userHasHierarchy.findAll({
      where: { user_id: req.user.id },
      attributes: ["organization_hierarchy_id"]
    });

    const userHierarchyIds = userHierarchies.map(h => h.organization_hierarchy_id);

    if (userHierarchyIds.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You have no assigned hierarchy. Contact your administrator."
      });
    }

    // 2️⃣ Get all descendant hierarchy IDs (including user's hierarchies)
    const allowedHierarchyIds = await getAllHierarchyIds(
      userHierarchyIds,
      organizationHierarchy
    );

    // 3️⃣ Fetch hierarchy records with their geographic scope
    const hierarchies = await organizationHierarchy.findAll({
      where: { organization_hierarchy_id: allowedHierarchyIds },
      attributes: ['organization_hierarchy_id', 'region_id', 'city_id', 'subcity_id', 'zone_id', 'woreda_id'],
    });

    // 4️⃣ Build WHERE condition for complaints
    const where = {};
    if (status) where.status = status;

    const geographicConditions = hierarchies
      .filter(h => h.region_id || h.city_id || h.subcity_id || h.zone_id || h.woreda_id)
      .map(h => {
        if (h.woreda_id) return { woreda_id: h.woreda_id };
        if (h.zone_id) return { zone_id: h.zone_id };
        if (h.subcity_id) return { subcity_id: h.subcity_id };
        if (h.city_id) return { city_id: h.city_id };
        if (h.region_id) return { region_id: h.region_id };
        return {};
      });

    if (geographicConditions.length === 1) {
      Object.assign(where, geographicConditions[0]);
    } else if (geographicConditions.length > 1) {
      where[Op.or] = geographicConditions;
    }

    // 5️⃣ Query all complaints with safe includes
    const complaints = await Complaint.findAll({
      where,
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
          model: Case,
          as: "case",
          include: [
            {
              model: CaseInvestigation,
              as: "case_investigation",
              attributes: ["case_investigation_id", "case_id", "status", "created_at"], // only existing columns
              include: [
                { model: CaseAttachement, as: "case_attachement" }
              ]
            }
          ]
        }
      ],
      order: [["created_at", "DESC"]],
    });

    if (!complaints || complaints.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No complaints found for your hierarchy",
        data: [],
        total: 0
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaints retrieved successfully",
      data: complaints,
      total: complaints.length
    });

  } catch (error) {
    console.error("Error in getAllComplaintForDuptyDirector:", error);
    console.error("Stack trace:", error.stack);

    if (error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        success: false,
        message: "Database error occurred",
        error: error.message,
        details: error.parent ? error.parent.detail : null
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching complaints",
      error: error.message
    });
  }
};

async function getAllHierarchyIds(rootIds, organizationHierarchy) {
  const allIds = new Set(rootIds);
  let queue = [...rootIds];

  while (queue.length) {
    const children = await organizationHierarchy.findAll({
      where: { parent_id: queue },
      attributes: ["organization_hierarchy_id"]
    });

    const childIds = children.map(c => c.organization_hierarchy_id);

    childIds.forEach(id => allIds.add(id));

    queue = childIds;
  }

  return [...allIds];
};


exports.getAssignedComplaintForTaskForce = async (req, res) => {
  try {
    const expert_id = req.user.id;
    if (!req.user.permissions.includes("taskForce:can-get-complaint")) {
      return res.status(403).json({ message: "You do not have permission" });
    }

    let { page = 1, limit = 10, status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    // Attachment type helper
    const getAttachmentType = (filename) => {
      if (!filename) return "unknown";

      const ext = filename.split(".").pop().toLowerCase();
      const image = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
      const video = ["mp4", "avi", "mov", "wmv", "mkv"];
      const audio = ["mp3", "wav", "aac", "m4a", "ogg"];
      const document = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];

      if (image.includes(ext)) return "image";
      if (video.includes(ext)) return "video";
      if (audio.includes(ext)) return "audio";
      if (document.includes(ext)) return "document";

      return "unknown";
    };

    // Build filter
    const whereCondition = { accepted_by: expert_id };
    if (status) {
      const statusArray = status.split(",");
      whereCondition.status =
        statusArray.length > 1
          ? { [Sequelize.Op.in]: statusArray }
          : statusArray[0];
    }

    // Query DB
    const { count, rows } = await Complaint.findAndCountAll({
      where: whereCondition,
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
     
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    // No results found
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No complaints assigned to this expert",
      });
    }

    rows.forEach((complaint) => {
      if (complaint.attachments?.length > 0) {
        complaint.attachments = complaint.attachments.map((att) => ({
          ...att.dataValues,
          type: getAttachmentType(att.file_path || att.url || att.filename),
        }));
      }

      if (
        complaint.case?.case_investigation &&
        complaint.case.case_investigation.length > 0
      ) {
        complaint.case.case_investigation =
          complaint.case.case_investigation.map((investigation) => {
            if (investigation.case_attachement?.length > 0) {
              investigation.case_attachement =
                investigation.case_attachement.map((att) => ({
                  ...att.dataValues,
                  type: getAttachmentType(
                    att.file_path || att.url || att.filename
                  ),
                }));
            }
            return investigation;
          });
      }
    });
    return res.status(200).json({
      success: true,
      message: "Assigned complaints retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching assigned complaints",
      error: error.message,
    });
  }
};

exports.getDetailAssignedCase = async (req, res) => {
  const { complaint_id } = req.params;

  if (!complaint_id) {
    return res.status(400).json({
      success: false,
      message: "complaint_id is required",
    });
  }

  try {
    const complaint = await Complaint.findOne({
      where: { complaint_id },
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
        { model: RejectionReason, as: "rejection_reason" },
        { model: ActivityLog, as: "activity_logs" ,
          include:[
            {
              model:AdministratorAccounts,
              as:"user"
            },
          ]
        },

        {
          model: Case,
          as: "case",
          include: [
             {
              model: CaseHasReturn,
              as: "caseHasReturn",
              include:[
                {model:AdministratorAccounts,as:"rejectedBy"},
                {model:RejectionReason,as:"rejection_reason"}
              ]
            },
            {
              model: CaseInvestigation,
              as: "case_investigation",
              attributes: ["case_investigation_id", "case_id", "status", "created_at"], // only existing columns
              include: [
                { model: CaseAttachement, as: "case_attachement" }
              ]
            },
             { model: ActivityLog, as: "activity_logs" ,
          include:[
            {
              model:AdministratorAccounts,
              as:"user"
            },
          ]
        },
           
             {
                          model: TeamCase,
                          as: "teamCase",
                          required: false,
                          include:[{model:AdministratorAccounts,as:"user"}]
                        },
                         {
              model: ExpertCase,
              as: "expertCase",
              required: false,
              include:[{model:AdministratorAccounts,as:"user"}]
            },
            {model:ClosingAttachement,as:"closingAttachement"},
             {
              model: ReportSubmissions,
              as: "reportSubmissions",
              include:[{
                model:PenalitySubCategory,
                as:"penalitySubCategory"
              }]
            },
          ]
        }
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }
 const complaintJSON = complaint.get({ plain: true });

    if (complaintJSON.case) {
      complaintJSON.case.remaining_days =
        calculateRemainingDays(complaintJSON.case);
    }
    return res.status(200).json({
      success: true,
      data: complaintJSON,
    });
  } catch (err) {
    console.error("ERROR getDetailAssignedCase:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch case details",
      error: err.message,
    });
  }
};

exports.verifyAndChooseHandlingUnit = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    if (!req.user.permissions.includes("taskForce:can-verify-complaint")) {
      return res.status(403).json({ message: "You do not have permission" });
    }

    const { complaint_id } = req.params;
    const { handling_unit, is_Team_Formation_needed } = req.body;

    if (!handling_unit) {
      await transaction.rollback();
      return res.status(400).json({ message: "handling_unit is required" });
    }

    const validUnits = ["temporary_team", "regional_team", "hq_expert"];
    if (!validUnits.includes(handling_unit)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid handling_unit" });
    }

    // 1️⃣ Fetch complaint
    const complaint = await Complaint.findByPk(complaint_id, { transaction });

    if (!complaint) {
      await transaction.rollback();
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!complaint.subpollution_category_id) {
      await transaction.rollback();
      return res.status(400).json({
        sucess:false,
        message: "Complaint cannot be verified because pollution subcategory is not assigned",
      });
    }

    // 2️⃣ Fetch Sub Pollution Category
    const subCategory = await SubPollutionCategory.findByPk(
      complaint.subpollution_category_id,
      { transaction }
    );
    if (!subCategory) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Sub pollution category not found",
      });
    }

    let investigation_days = parseInt(subCategory.investigation_days, 10);
    if (isNaN(investigation_days) || investigation_days <= 0) {
      investigation_days = 14;
    }

    // 4️⃣ Update complaint
    const old_status = complaint.status;

    complaint.status = "Verified";
    complaint.handling_unit = handling_unit;

    if (typeof is_Team_Formation_needed === "boolean") {
      complaint.is_Team_Formation_needed = is_Team_Formation_needed;
    }

    await complaint.save({ transaction });

    // 5️⃣ Activity log
    await ActivityLog.create(
      {
        user_id: req.user.id,
        entity_type: "Complaint",
        entity_id: complaint.complaint_id,
        old_status,
        new_status: complaint.status,
        description: `Complaint verified. Handling unit: ${handling_unit}. Investigation days: ${investigation_days}`,
      },
      { transaction }
    );

    // 6️⃣ Generate unique case number
    let caseNo;
    let exists = true;

    while (exists) {
      caseNo = Math.floor(100000 + Math.random() * 900000);
      const existingCase = await Case.findOne({
        where: { case_no: caseNo },
        transaction,
      });
      if (!existingCase) exists = false;
    }

    // 7️⃣ Create case
    const createdCase = await Case.create(
      {
        case_id: uuidv4(),
        case_no: caseNo,
        complaint_id: complaint.complaint_id,
        status:
          handling_unit === "hq_expert"
            ? "Pending Expert Assignment"
            : "assigned_to_region",
      },
      { transaction }
    );

    // 8️⃣ Notify customer
    if (complaint.customer_id) {
      sendRealtimeNotification(complaint.customer_id, {
        complaintId: complaint.report_id,
        status: complaint.status,
        message: `Your complaint has been verified. Report No: ${complaint.report_id}`,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Complaint verified and handling unit assigned successfully",
      complaint,
      case: createdCase,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("verifyAndChooseHandlingUnit error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.verifyComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {

    if (!req.user.permissions.includes("taskForce:can-verify-complaint")) {
      return res.status(403).json({ message: "You do not have permission" });
    }
    const { complaint_id } = req.params;
    let { is_Team_Formation_needed } = req.body;

    // investigation_days = parseInt(investigation_days, 10);
    // if (isNaN(investigation_days) || investigation_days <= 0) {
    //   investigation_days = 14;
    // }

    const complaint = await Complaint.findByPk(complaint_id, { transaction });

    if (!complaint) {
      await transaction.rollback();
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!complaint.subpollution_category_id) {
      await transaction.rollback();
      return res.status(400).json({
        status:false,
        message: "Complaint cannot be verified because pollution subcategory is not assigned"
      });
    }
    if (!complaint.handling_unit) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Complaint cannot be verified because handling unit is not assigned"
      });
    }
    const old_status = complaint.status;
    complaint.status = "Verified";

    if (typeof is_Team_Formation_needed === "boolean") {
      complaint.is_Team_Formation_needed = is_Team_Formation_needed;
    }

    await complaint.save({ transaction });

    await ActivityLog.create(
      {
        user_id: req.user.id,
        entity_type: "Complaint",
        entity_id: complaint.complaint_id,
        old_status,
        new_status: complaint.status,
        description: `Complaint verified${is_Team_Formation_needed ? " and Team Formation needed set" : ""}`,
      },
      { transaction }
    );

    let caseNo;
    let exists = true;

    while (exists) {
      caseNo = Math.floor(100000 + Math.random() * 900000);
      const existingCase = await Case.findOne({ where: { case_no: caseNo }, transaction });
      if (!existingCase) exists = false;
    }

    const createdCase = await Case.create(
      {
        case_id: uuidv4(),
        case_no: caseNo,
        complaint_id: complaint.complaint_id,
        status: "Pending Expert Assignment",
      },
      { transaction }
    );

      if (complaint.customer_id) { 
      sendRealtimeNotification(complaint.customer_id, {
        complaintId: complaint.report_id,
        status: complaint.status,
        message: `Your complaint has been verified. Report No: ${complaint.report_id}`,
      });
    }
    await transaction.commit();

    return res.status(200).json({
      message: "Complaint verified successfully",
      case: createdCase,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("verifyComplaint error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.acceptSuggestionStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { complaint_id } = req.params;
    const complaint = await Complaint.findByPk(complaint_id, { transaction });

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (complaint.status !== "Verified") return res.status(400).json({ message: "Suggestion cannot be accepted unless complaint is Verified" });
    if (!complaint.is_Team_Formation_needed) return res.status(400).json({ message: "Suggestion cannot be accepted unless Team Formation is suggested" });

    const old_status = complaint.suggestion_status;
    complaint.suggestion_status = "Accepted";
    await complaint.save({ transaction });

    await ActivityLog.create({
      user_id: req.user.id,
      entity_type: "Complaint",
      entity_id: complaint.complaint_id,
      old_status,
      new_status: complaint.suggestion_status,
      description: "Suggestion accepted for complaint",
      transaction
    });

    let caseNo;
    let exists = true;
    while (exists) {
      caseNo = Math.floor(100000 + Math.random() * 900000);
      const existingCase = await Case.findOne({ where: { case_no: caseNo }, transaction });
      if (!existingCase) exists = false;
    }

    await Case.create(
      {
        case_id: uuidv4(),
        case_no: caseNo,
        complaint_id: complaint.complaint_id,
        status: "Pending Expert Assignment",
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).json({ message: "Suggestion accepted and Case created successfully" });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
exports.updateComplaintDetails = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { complaint_id } = req.params;
    const updateData = req.body;

    // Find complaint
    const complaint = await Complaint.findByPk(complaint_id, { transaction });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Prevent updates after verification
    if (complaint.status === "Verified") {
      return res.status(400).json({ message: "Cannot update complaint details after verification" });
    }

    // Extract old values ONLY for keys being updated
    const old_data = {};
    for (let key in updateData) {
      old_data[key] = complaint[key];
    }

    // Update complaint
    await complaint.update(updateData, { transaction });

    // Log changes
    await ActivityLog.create(
      {
        user_id: req.user.id,
        entity_type: "Complaint",
        entity_id: complaint.complaint_id,
        old_status: "updated",
        new_status: "updated",
        description: "Complaint details updated"
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    return res.status(200).json({
      success:true,
      message: "Complaint details updated successfully",
      updated_fields: updateData
    });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
exports.getExpertsByHierarchyId = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const userHierarchy = await userHasHierarchy.findOne({
      where: { user_id: userId },
      include: [
        {
          model: organizationHierarchy,
          as: "hierarchy",
          attributes: ["region_id", "city_id"],
        },
      ],
    });

    if (!userHierarchy?.hierarchy) {
      return res.status(404).json({
        success: false,
        message: "User hierarchy not found",
      });
    }

    const { region_id, city_id } = userHierarchy.hierarchy;

    if (!region_id && !city_id) {
      return res.status(400).json({
        success: false,
        message: "User has no region or city assigned",
      });
    }

    const hierarchyWhere = {};

    if (city_id) {
      hierarchyWhere.city_id = city_id;
    } else {
      hierarchyWhere.region_id = region_id;
    }
console.log("hierarchyWhere",hierarchyWhere)
    const experts = await AdministratorAccounts.findAll({
      distinct: true,
      include: [
        {
          model: userHasHierarchy,
          as: "hierarchies",
          required: true,
          include: [
            {
              model: organizationHierarchy,
              as: "hierarchy",
              required: true,
              where: hierarchyWhere,
           include: [
            {
              model: organizationHierarchy,
              as: "parent",
              required: true,
            },
            
          ],
            },
            
          ],
        },

        {
          model: Role,
          as: "roles",
          required: true,
          duplicating: false,
          include: [
            {
              model: RoleHasPermission,
              as: "roleHasPermissions",
              required: true,
              include: [
                {
                  model: Permission,
                  as: "permission",
                  required: true,
                  where: {
                    resource: "expert",
                    action: "can-get-case",
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: experts.length,
      experts,
    });

  } catch (error) {
    console.error("getExpertsByHierarchyId error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getExpertsByZoneHierarchyId = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const userHierarchy = await userHasHierarchy.findOne({
      where: { user_id: userId },
      include: [
        {
          model: organizationHierarchy,
          as: "hierarchy",
          attributes: ["zone_id", "subcity_id"],
        },
      ],
    });

    if (!userHierarchy?.hierarchy) {
      return res.status(404).json({
        success: false,
        message: "User hierarchy not found",
      });
    }

    const { zone_id, subcity_id } = userHierarchy.hierarchy;

    if (!zone_id && !subcity_id) {
      return res.status(400).json({
        success: false,
        message: "User has no zone or subcity assigned",
      });
    }

    const hierarchyWhere = {};

    if (subcity_id) {
      hierarchyWhere.subcity_id = subcity_id;
    } else {
      hierarchyWhere.zone_id = zone_id;
    }

    const experts = await AdministratorAccounts.findAll({

      distinct: true,
      include: [
        {
          model: userHasHierarchy,
          as: "hierarchies",
          required: true,
          include: [
            {
              model: organizationHierarchy,
              as: "hierarchy",
              required: true,
              where: hierarchyWhere,
            },
          ],
        },

        {
          model: Role,
          as: "roles",
          required: true,
          duplicating: false,
          include: [
            {
              model: RoleHasPermission,
              as: "roleHasPermissions",
              required: true,
              include: [
                {
                  model: Permission,
                  as: "permission",
                  required: true,
                  where: {
                    resource: "expert",
                    action: "can-get-case",
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: experts.length,
      experts,
    });

  } catch (error) {
    console.error("getExpertsByZoneHierarchyId error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getExpertsByWoredaHierarchyId = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const userHierarchy = await userHasHierarchy.findOne({
      where: { user_id: userId },
      include: [
        {
          model: organizationHierarchy,
          as: "hierarchy",
          attributes: ["woreda_id"],
        },
      ],
    });

    if (!userHierarchy?.hierarchy) {
      return res.status(404).json({ message: "User hierarchy not found" });
    }

    const woredaId = userHierarchy.hierarchy.woreda_id;
    console.log("woredaIdworedaId",woredaId)
    const experts = await AdministratorAccounts.findAll({
      // where: {
      //   user_id: { [Op.ne]: userId },
      //   user_id: { [Op.ne]: userId },
      // },
      distinct: true,
      include: [
        {
          model: userHasHierarchy,
          as: "hierarchies",
          required: true,
          include: [
            {
              model: organizationHierarchy,
              as: "hierarchy",
              required: true,
              where: { woreda_id: woredaId },
              include:[{model:organizationHierarchy,as:"parent"}]
            },
          ],
        },

        // ✅ Permission filter (at least ONE role must match)
        {
          model: Role,
          as: "roles",
          required: true,
          duplicating: false,
          include: [
            {
              model: RoleHasPermission,
              as: "roleHasPermissions",
              required: true,
             include: [
        {
          model: Permission,
          as: "permission",
          required: true,
          where: {
            resource: "expert",
            action: "can-get-case",
          },
        },
      ],
            },
          ],
        },
      ],
    });

    return res.status(200).json(experts);
  } catch (error) {
    console.error("getExpertsByHierarchyId error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.getPendingComplaintsCount = async (req, res) => {
  try {
    const expert_id = req.user.id;

    if (!req.user.permissions.includes("taskForce:can-get-complaint")) {
      return res.status(403).json({ 
        success: false, 
        message: "You do not have permission" 
      });
    }

    // Count all pending complaints
    const pendingCount = await Complaint.count({
      where: { 
        status: "Pending", 
        accepted_by: null 
      },
    });

    // Count complaints assigned to current user
    const assignedToMeCount = await Complaint.count({
      where: { 
        accepted_by: expert_id,
        status: ["Under Review", "Under Investigation", "Verified"]
      },
    });

    // Count total complaints in system
    const totalCount = await Complaint.count();

    return res.status(200).json({
      success: true,
      data: {
        pending_count: pendingCount,
        assigned_to_me: assignedToMeCount,
        total_reports: totalCount,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error getting pending count:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching pending count",
      error: error.message,
    });
  }
};