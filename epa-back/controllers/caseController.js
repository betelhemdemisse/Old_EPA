const {
  Complaint,
  ComplaintAttachement,
  City,
  sequelize,
  Subcity,
  Zone,
  Woreda,
  Region,
  UserHasSubCategory,
  PollutionCategory,
  SubPollutionCategory,
  CustomerAccount,
  AdministratorAccounts,
  RoleHasPermission,
  Permission,
  Role,
  RejectionReason,
  Case,
  ReportType,
  ExpertCase,
  CaseAttachement,
  ActivityLog,
  CaseInvestigation,
  TeamCase,
  CaseHasReturn,
  ReportSubmissions,
  ReportSubmissionValues
} = require("../models");
const { calculateRemainingDays } = require('../utils/caseUtils');
const { v4: uuidv4 } = require("uuid");
const { addDays, differenceInDays, formatDistanceStrict } = require("date-fns");
const { Op } = require("sequelize");
const { include } = require("underscore");
exports.getHQExperts = async (req, res)=>{
try {
    const experts = await AdministratorAccounts.findAll({
      where: {
        isRegional: false,
      },
      distinct: true,
      include: [
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
    return res.status(500).json({ message: "Server error" });
  }
}
// exports.assignExperts = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { complaint_id, expert_id } = req.body;

//     if (!complaint_id || !expert_id) {
//       await t.rollback();
//       return res.status(400).json({
//         message: "complaint_id and expert_id are required",
//       });
//     }

//     const complaint = await Complaint.findByPk(complaint_id, {
//       include: [
//         { model: Case, as: "case" },
//         { model: Woreda, as: "woreda" },
//         { model: SubPollutionCategory, as: "sub_pollution_category" },
//       ],
//       transaction: t,
//     });

//     if (!complaint || !complaint.case) {
//       await t.rollback();
//       return res.status(404).json({ message: "Complaint or case not found" });
//     }

//     const expert = await AdministratorAccounts.findOne({
//       where: { user_id: expert_id },
//       transaction: t,
//     });

//     if (!expert) {
//       await t.rollback();
//       return res.status(404).json({ message: "Expert not found" });
//     }

//     const existingAssignment = await ExpertCase.findOne({
//       where: { case_id: complaint.case.case_id },
//       transaction: t,
//     });

//     if (existingAssignment) {
//       await t.rollback();
//       return res.status(400).json({
//         message: "Case already assigned to an expert",
//       });
//     }

//     let investigation_days = parseInt(
//       complaint.sub_pollution_category?.investigation_days,
//       10
//     );

//     if (isNaN(investigation_days) || investigation_days <= 0) {
//       investigation_days = 14; // default
//     }

//     const old_case_status = complaint.case.status;
//     const countdown_start = new Date();
//     const countdown_end = addDays(countdown_start, investigation_days);

//     await complaint.case.update(
//       {
//         status: "assigned_to_expert",
//         status_changed_by: expert_id,
//         countdown_start_date: countdown_start,
//         countdown_end_date: countdown_end,
//       },
//       { transaction: t }
//     );

//     await ActivityLog.create(
//       {
//         user_id: expert_id,
//         entity_type: "Case",
//         entity_id: complaint.case.case_id,
//         old_status: old_case_status,
//         new_status: "assigned_to_expert",
//         description: `Case assigned to expert ${expert_id}. Investigation days: ${investigation_days}`,
//       },
//       { transaction: t }
//     );

//     await ExpertCase.create(
//       {
//         expert_case_id: uuidv4(),
//         user_id: expert_id,
//         case_id: complaint.case.case_id,
//         created_by: expert_id,
//       },
//       { transaction: t }
//     );

//     const old_complaint_status = complaint.status;

//     await complaint.update(
//       { status: "under_investigation" },
//       { transaction: t }
//     );

//     await ActivityLog.create(
//       {
//         user_id: expert_id,
//         entity_type: "Complaint",
//         entity_id: complaint.complaint_id,
//         old_status: old_complaint_status,
//         new_status: "under_investigation",
//         description: `Complaint assigned for investigation to expert ${expert_id}`,
//       },
//       { transaction: t }
//     );

//     await t.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Expert assigned successfully",
//     });

//   } catch (error) {
//     await t.rollback();
//     console.error("Assign expert error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to assign expert",
//       error: error.message,
//     });
//   }
// };

exports.getCaseForExpert = async (req, res) => {
  const expert_id = req.user.id;

  if (!req.user.permissions.includes("expert:can-get-case")) {
    return res.status(403).json({ message: "You do not have permission" });
  }

  try {
    const expert = await AdministratorAccounts.findOne({
      where: { user_id: expert_id },
      include:[{model:UserHasSubCategory,as:"subcategories"}]
    });

    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }
  const expertSubcategoryIds = expert.subcategories.map(
  (sub) => sub.sub_pollution_category_id
);

if (!expertSubcategoryIds.length) {
  return res.status(400).json({ message: "Expert has no subcategory assigned" });
}

    let complaint;

    await sequelize.transaction(async (t) => {
      complaint = await Complaint.findOne({
        where: {
          status: "Verified",
          subpollution_category_id: expertSubcategoryIds,
          is_Team_Formation_needed: false,
          handling_unit: "hq_expert",
        },
        order: [["created_at", "DESC"]],
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
          {
            model: SubPollutionCategory,
            as: "sub_pollution_category",
            include: [{ model: ReportType, as: "report_types" }],
          },
          { model: Case, as: "case" },
        ],
        transaction: t,
      });

      if (!complaint) {
        throw new Error("No verified complaints available for expert subcategory");
      }

      let investigation_days = parseInt(
        complaint.sub_pollution_category?.investigation_days,
        10
      );

      if (isNaN(investigation_days) || investigation_days <= 0) {
        investigation_days = 14;
      }

      if (complaint.case) {
        const old_case_status = complaint.case.status;

        const countdown_start = new Date();
        const countdown_end = addDays(countdown_start, investigation_days);

        await complaint.case.update(
          {
            status: "assigned_to_expert",
            status_changed_by: expert_id,
            countdown_start_date: countdown_start,
            countdown_end_date: countdown_end,
            is_opened:true
          },
          { transaction: t }
        );


        await ExpertCase.create(
          {
            expert_case_id: uuidv4(),
            user_id: expert_id,
            case_id: complaint.case.case_id,
            created_by: expert_id,
          },
          { transaction: t }
        );
      }

      const old_complaint_status = complaint.status;

      await complaint.update(
        { status: "under_investigation" },
        
        { transaction: t }
      );

      await ActivityLog.create(
        {
          user_id: expert_id,
          entity_type: "Complaint",
          entity_id: complaint.complaint_id,
          old_status: old_complaint_status,
          new_status: "under_investigation",
          description: `Complaint assigned for investigation to expert ${expert_id}`,
        },
        { transaction: t }
      );
    });

    complaint = await complaint.reload({
      include: [{ model: Case, as: "case" }],
    });

    const complaintJSON = complaint.get({ plain: true });

    if (complaintJSON.case) {
      complaintJSON.case.remaining_days =
        calculateRemainingDays(complaintJSON.case);
    }

    return res.status(200).json({
      success: true,
      data: complaintJSON,
    });

  } catch (error) {
    console.error("ERROR getCaseForExpert:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch experts",
    });
  }
};

exports.countCaseForExpert = async (req, res) => {
  try {
    const expert_id = req.user.id;

    if (!req.user.permissions.includes("expert:can-get-case")) {
      return res.status(403).json({ message: "You do not have permission" });
    }

     const expert = await AdministratorAccounts.findOne({
      where: { user_id: expert_id },
      include:[{model:UserHasSubCategory,as:"subcategories"}]
    });

    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }
console.log("expertttttt", expert);

const expertSubcategoryIds = expert.subcategories.map(
  (sub) => sub.sub_pollution_category_id
);
console.log("expertSubcategoryIds", expertSubcategoryIds);
if (!expertSubcategoryIds.length) {
  return res.status(400).json({ message: "Expert has no subcategory assigned" });
}
    const count = await Complaint.count({
      where: {
        status: "Verified",
        subpollution_category_id: expertSubcategoryIds,
        is_Team_Formation_needed: false,
        handling_unit: "hq_expert",
      },
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to count complaints",
      error: error.message,
    });
  }
};

exports.deleteAttachment = async (req, res) => {
  const { case_attachment_id } = req.params;
  const expert_id = req.user.id;

  try {
    const attachment = await CaseAttachement.findOne({
      where: {case_attachement_id: case_attachment_id }    });

    if (!attachment) {
      return res.status(404).json({ success: false, message: "Attachment not found" });
    }

    if (attachment.created_by !== expert_id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this attachment"
      });
    }

    await attachment.destroy();

    return res.status(200).json({
      success: true,
      message: "Attachment deleted successfully"
    });
  } catch (error) {
    console.error("ERROR deleteAttachment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete attachment",
      error: error.message
    });
  }
};

exports.getAssignedCases = async (req, res) => {
  try {
    const expert_id = req.user.id;

    // ============= 1. Expert Cases (status: assigned_to_expert) ============
    const expertResult = await ExpertCase.findAll({
      where: { user_id: expert_id, status: "active" },
      include: [
        {
          model: Case,
          as: "case",
       where: {
  status: {
    [Op.in]: [
      "assigned_to_expert",
      "assigned_to_woreda_expert",
      "assigned_to_zone_expert",
      "Returned",
      "investigation_submitted",
      "Authorized",
    ],
  },
},

          include: [
            {
              model: Complaint,
              as: "complaint",
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
               { model: SubPollutionCategory, as: "sub_pollution_category",include:[
          {model:ReportType,as:"report_types"}
        ] },
              ],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    console.log("expertResult",expertResult.length)

    // ============= 2. Team Cases (status: teamCase) ============
    const teamResult = await TeamCase.findAll({
      where: { user_id: expert_id },
      include: [
        {
          model: Case,
          as: "case",
          where: { status: "teamCase" },
          include: [
            {
              model: Complaint,
              as: "complaint",
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
                { model: SubPollutionCategory, as: "sub_pollution_category",include:[
          {model:ReportType,as:"report_types"}
        ] },
              ],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    let allCases = [
      ...expertResult.map(ec => ec.case.get({ plain: true })),
      ...teamResult.map(tc => tc.case.get({ plain: true }))
    ];

    const uniqueCases = Object.values(
      allCases.reduce((acc, c) => {
        acc[c.case_id] = c;
        return acc;
      }, {})
    );

    const finalData = uniqueCases.map(c => ({
      ...c,
      remaining_days: calculateRemainingDays(c),
    }));
    return res.status(200).json({
      success: true,
      data: finalData,
    });

  } catch (err) {
    console.error("ERROR getAssignedCases:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned cases",
      error: err.message,
    });
  }
};

exports.getDetailAssignedCase = async (req, res) => {
  const expert_id = req.user.id;
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
        {
          model: SubPollutionCategory,
          as: "sub_pollution_category",
          include: [{ model: ReportType, as: "report_types" }],
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
          model: Case,
          as: "case",
          include: [
            {
              model: ExpertCase,
              as: "expertCase",
              where: { user_id: expert_id },
              required: false,
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
              model: ReportSubmissions,
              as: "reportSubmissions",
              include:[{model:ReportSubmissionValues,as:"values"}]
            },
            {
              model: TeamCase,
              as: "teamCase",
              required: false,
              include:[{model:AdministratorAccounts,as:"user"}]
            },
            {
              model: CaseInvestigation,
              as: "case_investigation",
              required: false,
              include: [
                {
                  model: CaseAttachement,
                  as: "case_attachement",
                },
              ],
            },
            {
              model: CaseHasReturn,
              as: "caseHasReturn",
              include:[
                {model:AdministratorAccounts,as:"rejectedBy"},
                {model:RejectionReason,as:"rejection_reason"}
              ]
            },
          ],
        },
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.case) {
      const caseData = complaint.case.get({ plain: true });

      let investigation_days = parseInt(
        complaint.sub_pollution_category?.investigation_days,
        10
      );

      if (isNaN(investigation_days) || investigation_days <= 0) {
        investigation_days = 14;
      }

      const remaining = calculateRemainingDays(
        caseData,
        investigation_days
      );

      caseData.remaining_days = remaining;

      const shouldRemind =
        remaining &&
        !remaining.isExpired &&
        remaining.daysLeft <= 2 &&
        !caseData.reminder_sent;

      caseData.reminder = shouldRemind;

      if (shouldRemind) {
        await complaint.case.update({ reminder_sent: true });
      }

      complaint.dataValues.case = caseData;
    }

    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (err) {
    console.error("ERROR getDetailAssignedCase:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint details",
      error: err.message,
    });
  }
};
exports.returnCase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { case_id } = req.params;
    const { rejection_reason_id, description } = req.body;
    const userId = req.user.id;

    console.log("return case", case_id, rejection_reason_id, description);

    if (!case_id) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Case ID is required",
      });
    }

    const caseRecord = await Case.findOne({
      where: { case_id },
      transaction,
    });

    if (!caseRecord) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const old_status = caseRecord.status;

    // Create return record
    await CaseHasReturn.create(
      {
        case_id,
        rejection_reason_id,
        additional_description: description,
        rejected_by: userId,
        created_by: userId,
      },
      { transaction }
    );

    // Update case status
    await caseRecord.update(
      {
        status: "Returned",
        updated_by: userId,
      },
      { transaction }
    );
 await CaseInvestigation.update(
      { status: "pending" },
      {
        where: { case_id: case_id },
        transaction,
      }
    );
    await Complaint.update(
      {
        status: "returned",
        updated_by: userId,
      },
      {
        where: { complaint_id: caseRecord.complaint_id },
        transaction,
      }
    );

    await ActivityLog.create(
      {
        user_id: userId,
        entity_type: "Case",
        entity_id: case_id,
        old_status: old_status,
        new_status: "Returned",
        description: description || "Case returned",
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Case and complaint returned successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Return case error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to return case",
    });
  }
};


exports.submitInvestigation = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const expert_id = req.user.id;
    const user_permissions = req.user.permissions || [];
    const { case_id } = req.params;
    const { description, isFinal } = req.body;
    const files = req.files || [];

    /* --------------------------------------------------
       CASE OWNERSHIP & PERMISSION CHECK
    -------------------------------------------------- */

    let caseData = null;
    let isTeamCase = false;

    const caseRecord = await ExpertCase.findOne({
      where: { case_id, user_id: expert_id },
      include: [{ model: Case, as: "case" }],
      transaction: t,
    });

    if (caseRecord) {
      caseData = caseRecord.case;

      if (!user_permissions.includes("expert:can-upload-investigation")) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to upload for this case",
        });
      }
    } else {
      isTeamCase = true;

      const teamCaseRecord = await TeamCase.findOne({
        where: { case_id, user_id: expert_id },
        include: [{ model: Case, as: "case" }],
        transaction: t,
      });

      if (!teamCaseRecord) {
        return res.status(404).json({
          success: false,
          message: "Case not found or not assigned to this user",
        });
      }

      caseData = teamCaseRecord.case;

      if (!user_permissions.includes("teamLead:can-upload-investigation")) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to upload for this team case",
        });
      }
    }

    /* --------------------------------------------------
       INVESTIGATION LOOKUP (LATEST ONLY)
    -------------------------------------------------- */

    let investigation = await CaseInvestigation.findOne({
      where: { case_id },
      order: [["created_at", "DESC"]], // use your timestamp column
      transaction: t,
    });

    /* --------------------------------------------------
       FINAL STATUS GUARD
       (Returned cases are allowed to continue)
    -------------------------------------------------- */

    if (
      investigation &&
      investigation.status === "final" &&
      caseData.status !== "Returned"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This investigation has already been completed. No further uploads allowed.",
      });
    }

    /* --------------------------------------------------
       CREATE INVESTIGATION (ONLY IF NONE EXISTS)
    -------------------------------------------------- */

    if (!investigation) {
      investigation = await CaseInvestigation.create(
        {
          case_investigation_id: uuidv4(),
          case_id,
          status: "pending",
          created_by: expert_id,
        },
        { transaction: t }
      );
    }

    /* --------------------------------------------------
       HANDLE RETURNED CASE FINAL ATTACHMENTS
    -------------------------------------------------- */

    if (caseData.status === "Returned" && (isFinal === true || isFinal === "true")) {
      // Reset all previous attachments marked as final
      await CaseAttachement.update(
        { isFinal: false },
        {
          where: {
            case_id,
            isFinal: true,
          },
          transaction: t,
        }
      );
    }

    /* --------------------------------------------------
       FILE UPLOAD
    -------------------------------------------------- */

    for (const file of files) {
      await CaseAttachement.create(
        {
          case_attachement_id: uuidv4(),
          case_id,
          case_investigation_id: investigation.case_investigation_id,
          file_path: file.path,
          file_name: file.originalname,
          description,
          isFinal: isFinal === true || isFinal === "true",
          created_by: expert_id,
        },
        { transaction: t }
      );
    }

    /* --------------------------------------------------
       FINALIZE INVESTIGATION (ONLY WHEN REQUESTED)
    -------------------------------------------------- */

    if (isFinal === true || isFinal === "true") {
      await investigation.update(
        {
          status: "final",
          updated_by: expert_id,
        },
        { transaction: t }
      );
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message:
        isFinal === true || isFinal === "true"
          ? "Final investigation submitted"
          : "Investigation files uploaded",
      investigation_id: investigation.case_investigation_id,
    });

  } catch (error) {
    await t.rollback();
    console.error("submitInvestigation ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit investigation",
      error: error.message,
    });
  }
};


exports.changeCaseInvestigationStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const user_id = req.user.id;
    const user_permissions = req.user.permissions;
    const { case_investigation_id, status, rejection_reason_id } = req.body;

    const validStatuses = [
      "final",
      "approved_by_team_leader",
      "approved_by_department_head",
      "approved_by_dupty_director",
      "rejected_by_team_leader",
      "rejected_by_department_head",
      "rejected_by_director",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided.",
      });
    }

    const investigation = await CaseInvestigation.findOne({
      where: { case_investigation_id },
      include: [
        {
          model: Case,
          as: 'case',
          include: [
            {
              model: Complaint, as: 'complaint',
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
                { model: SubPollutionCategory, as: "sub_pollution_category" },]
            }
          ]
        }
      ]
    });

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: "Case investigation not found",
      });
    }

    if (user_permissions.includes("teamHead:approve_and_reject")) {
      if (investigation.status !== "final") {
        return res.status(400).json({
          success: false,
          message: "Team Head can only approve/reject final investigations.",
        });
      }

      if (investigation.case.status !== "investigation_submitted") {
        return res.status(400).json({
          success: false,
          message: "The case is not in 'investigation_submitted' status.",
        });
      }

    } else if (user_permissions.includes("departmentHead:approve_and_reject")) {
      if (investigation.status !== "approved_by_team_leader") {
        return res.status(400).json({
          success: false,
          message: "Department Head can only approve/reject investigations approved by Team Head.",
        });
      }

    } else if (user_permissions.includes("duptyDirector:approve_and_reject")) {
      if (investigation.status !== "approved_by_department_head") {
        return res.status(400).json({
          success: false,
          message: "Deputy Director can only approve/reject investigations approved by Department Head.",
        });
      }

    } else {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to approve or reject this investigation.",
      });
    }
    if (status.startsWith("rejected") && !rejection_reason_id) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason must be provided when rejecting an investigation.",
      });
    }
    const old_status = investigation.status;

    await investigation.update(
      {
        status,
        updated_by: user_id,
        updated_at: new Date(),
      },
      { transaction: t }
    );

      await ActivityLog.create(
        {
           user_id,
           entity_type: "CaseInvestigation",
           entity_id: case_investigation_id,
           old_status,
           new_status: status,
           description: `Case investigation status changed from ${old_status} → ${status}${rejection_reason_id ? ` (reason ID: ${rejection_reason_id})` : ""
          } by user ${user_id}`,
        },
        { transaction: t }
      );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: `Case investigation status updated to ${status}`,
    });

  } catch (error) {
    await t.rollback();
    console.error("changeCaseInvestigationStatus ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update case investigation status",
      error: error.message,
    });
  }
};

exports.getchangeCaseInvestigationStatus = async (req, res) => {
  try {
    const { case_id, case_attachement_id } = req.params;

    const caseAttachment = await CaseAttachement.findOne({
      where: { case_id, case_attachement_id },
      attributes: ["case_attachement_id", "case_id", "status", "created_at"]
    });

    if (!caseAttachment) {
      return res.status(404).json({
        success: false,
        message: "Case attachment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: caseAttachment
    });

  } catch (error) {
    console.error("getchangeCaseInvestigationStatus ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch case attachment status",
      error: error.message,
    });
  }
};
exports.getAllComplaints = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const { count, rows: complaints } = await Complaint.findAndCountAll({
      include: [
        { model: ComplaintAttachement, as: 'attachments' },
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
          model: Case, as: "case",
          include: [
            {
              model: CaseInvestigation, as: "case_investigation",
              include: [
                { model: CaseAttachement, as: "case_attachement" }
              ]
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
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
// exports.extendInvestigationDays = async (req, res) => {
//   const user_id = req.user.id;
//   const { case_id, additional_days, reason } = req.body;

//   if (!req.user.permissions.includes("case:can-extend-investigation")) {
//     return res.status(403).json({ message: "You do not have permission to extend investigation days" });
//   }

//   if (!case_id || !additional_days || additional_days <= 0) {
//     return res.status(400).json({ message: "case_id and positive additional_days are required" });
//   }

//   try {
//     await sequelize.transaction(async (t) => {
//       const caseRecord = await Case.findOne({ where: { case_id }, transaction: t });

//       if (!caseRecord) {
//         throw new Error("Case not found");
//       }

//       const old_end_date = caseRecord.countdown_end_date;
//       const old_investigation_days = caseRecord.investigation_days || 0;
//       const old_extended_days = parseInt(caseRecord.extended_days || "0", 10);
//       const old_status = caseRecord.status;

//       const new_end_date = addDays(old_end_date, additional_days);
//       const new_investigation_days = old_investigation_days + additional_days;

//       const new_extended_days = old_extended_days + additional_days;

//       await caseRecord.update(
//         {
//           countdown_end_date: new_end_date,
//           investigation_days: new_investigation_days,
//           is_extended: true,
//           extended_days: new_extended_days.toString(),
//           extended_by: user_id,
//           updated_by: user_id
//         },
//         { transaction: t }
//       );

//       await ActivityLog.create(
//         {
//           user_id,
//           entity_type: "Case",
//           entity_id: case_id,
//           old_status,
//           new_status: old_status,
//           description: `Extended investigation by ${additional_days} day(s). Reason: ${reason || "Not provided"}`,
//         },
//         { transaction: t }
//       );
//     });

//     const updatedCase = await Case.findOne({ where: { case_id } });
//     return res.status(200).json({ success: true, message: "Investigation days extended successfully", data: updatedCase });
//   } catch (error) {
//     console.error("ERROR extendInvestigationDays:", error);
//     if (res.headersSent) return;
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.reduceInvestigationDays = async (req, res) => {
//   const user_id = req.user.id;
//   const { case_id, reduction_days, reason } = req.body;

//   if (!req.user.permissions.includes("case:can-reduce-investigation")) {
//     return res.status(403).json({ message: "You do not have permission to reduce investigation days" });
//   }

//   if (!case_id || !reduction_days || reduction_days <= 0) {
//     return res.status(400).json({ message: "case_id and positive reduction_days are required" });
//   }

//   try {
//     await sequelize.transaction(async (t) => {
//       const caseRecord = await Case.findOne({ where: { case_id }, transaction: t });

//       if (!caseRecord) {
//         throw new Error("Case not found");
//       }

//       const old_end_date = caseRecord.countdown_end_date;
//       const old_status = caseRecord.status;
//       const old_investigation_days = caseRecord.investigation_days || 0;
//       const old_extended_days = parseInt(caseRecord.extended_days || "0", 10);

//       const new_end_date = addDays(old_end_date, -reduction_days);
//       const new_investigation_days = Math.max(old_investigation_days - reduction_days, 0);

//       const new_extended_days = old_extended_days - reduction_days;

//       await caseRecord.update(
//         {
//           countdown_end_date: new_end_date,
//           investigation_days: new_investigation_days,
//           is_extended: true,
//           extended_days: new_extended_days.toString(),
//           extended_by: user_id,
//           updated_by: user_id
//         },
//         { transaction: t }
//       );

//       await ActivityLog.create(
//         {
//           user_id,
//           entity_type: "Case",
//           entity_id: case_id,
//           old_status,
//           new_status: old_status,
//           description: `Reduced investigation by ${reduction_days} day(s). Reason: ${reason || "Not provided"}`,
//         },
//         { transaction: t }
//       );
//     });

//     const updatedCase = await Case.findOne({ where: { case_id } });
//     return res.status(200).json({ success: true, message: "Investigation days reduced successfully", data: updatedCase });
//   } catch (error) {
//     console.error("ERROR reduceInvestigationDays:", error);
//     if (res.headersSent) return;
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };
