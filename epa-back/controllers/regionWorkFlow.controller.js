
const {
  Complaint,
  ComplaintAttachement,
  Case,
  ExpertCase,
  CaseInvestigation,
  CaseAttachement,
  AdministratorAccounts,
  userHasHierarchy,
  organizationHierarchy,
  Region,
  Zone,
  Subcity,
  City,
  Woreda,
  sequelize,
  ActivityLog,
  CustomerAccount,
  PollutionCategory,
  SubPollutionCategory,
  TeamCase,
  ReportType,
} = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { addDays } = require("date-fns");
const { calculateRemainingDays } = require("../utils/caseUtils");

const { submitInvestigation, deleteAttachment } = require("./caseController");


  //  Region Admin – Pull next complaint

exports.getComplaintForRegionAdmin = async (req, res) => {
  try {
    const admin_id = req.user.id;

    if (!req.user.permissions.includes("region:can-get-complaint")) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const admin = await AdministratorAccounts.findOne({
      where: { user_id: admin_id },
      include: [
        {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [
            {
              model: organizationHierarchy,
              as: "hierarchy",
              include: [
                { model: Region, as: "region" },
                { model: City, as: "city" },
              ],
            },
          ],
        },
      ],
    });

    const hierarchy = admin?.hierarchies?.[0]?.hierarchy;

    const region_id = hierarchy?.region?.region_id || null;
    const city_id = hierarchy?.city?.city_id || null;

    if (!region_id && !city_id) {
      return res.status(400).json({
        success: false,
        message: "No region or city assigned to this admin",
      });
    }

    const whereClause = {
      status: {
        [Op.in]: [
          "Verified",
          "under_investigation",
          "investigation_submitted",
          "assigned_to_regional_expert",
          "returned",
          "closed"
        ],
      },
      handling_unit: "regional_team",
    };

    if (region_id) {
      whereClause.region_id = region_id;
    } else if (city_id) {
      whereClause.city_id = city_id;
    }

    const complaints = await Complaint.findAll({
      where: whereClause,
      include: [
        { model: ComplaintAttachement, as: "attachments" },
        { model: City, as: "city" },
        { model: Region, as: "region" },
        { model: Subcity, as: "subcity" },
        { model: Zone, as: "zone" },
        { model: CustomerAccount, as: "customer" },
        { model: AdministratorAccounts, as: "acceptedBy" },
        { model: PollutionCategory, as: "pollution_category" },
        { model: SubPollutionCategory, as: "sub_pollution_category" },
        { model: Case, as: "case" },
      ],
      order: [["created_at", "DESC"]],
    });

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No complaints found for this admin scope",
      });
    }

    return res.status(200).json({
      success: true,
      complaints,
    });

  } catch (err) {
    console.error("getComplaintForRegionAdmin error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

   // Region Admin → Assign to Zone or Expert (status-based only)
   
exports.assignToHierarchy = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { complaint_id, case_status, assign_to, expert_id } = req.body;
    const admin_id = req.user.id;

    // 1️⃣ Permission check
    if (!req.user.permissions.includes("region:can-assign")) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    // 2️⃣ Load admin with hierarchy (region OR city)
    const admin = await AdministratorAccounts.findOne({
      where: { user_id: admin_id },
      include: [
        {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [
            {
              model: organizationHierarchy,
              as: "hierarchy",
              include: [
                { model: Region, as: "region" },
                { model: City, as: "city" },
              ],
            },
          ],
        },
      ],
      transaction: t,
    });

    const hierarchy = admin?.hierarchies?.[0]?.hierarchy;
    const adminRegionId = hierarchy?.region?.region_id || null;
    const adminCityId = hierarchy?.city?.city_id || null;

    if (!adminRegionId && !adminCityId) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Admin has no region or city assigned",
      });
    }

    // 3️⃣ Fetch complaint + case
    const complaint = await Complaint.findByPk(complaint_id, {
      include: [
        { model: Case, as: "case" },
        { model: Region, as: "region" },
        { model: City, as: "city" },
        { model: SubPollutionCategory, as: "sub_pollution_category" },
      ],
      transaction: t,
    });

    if (!complaint || !complaint.case) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Complaint or case not found",
      });
    }

    // 4️⃣ Ownership validation (region OR city)
    if (adminRegionId && complaint.region_id !== adminRegionId) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "You cannot assign complaints outside your region",
      });
    }

    if (!adminRegionId && adminCityId && complaint.city_id !== adminCityId) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "You cannot assign complaints outside your city",
      });
    }

    let newStatus;
    const oldCaseStatus = complaint.case.status;

    // 5️⃣ Assignment logic
    if (assign_to === "expert") {
      if (!expert_id) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "expert_id is required",
        });
      }

      let investigation_days = parseInt(
        complaint.sub_pollution_category?.investigation_days,
        10
      );

      if (isNaN(investigation_days) || investigation_days <= 0) {
        investigation_days = 14;
      }

      await ExpertCase.create(
        {
          expert_case_id: uuidv4(),
          user_id: expert_id,
          case_id: complaint.case.case_id,
          created_by: admin_id,
        },
        { transaction: t }
      );

      await complaint.case.update(
        {
          status: case_status || "assigned_to_expert",
          status_changed_by: admin_id,
          countdown_start_date: null,
          countdown_end_date: null,
          is_opened: false,
        },
        { transaction: t }
      );

      await complaint.update(
        { status: "under_investigation" },
        { transaction: t }
      );

      newStatus = complaint.case.status;

      await ActivityLog.create(
        {
          user_id: admin_id,
          entity_type: "Case",
          entity_id: complaint.case.case_id,
          old_status: oldCaseStatus,
          new_status: newStatus,
          description: `Case assigned to expert ${expert_id}. Investigation days: ${investigation_days}`,
        },
        { transaction: t }
      );

    } else if (assign_to === "zone/city") {
      newStatus = "assigned_to_zone/city";

      await complaint.case.update(
        {
          status: newStatus,
          status_changed_by: admin_id,
        },
        { transaction: t }
      );

      await ActivityLog.create(
        {
          user_id: admin_id,
          entity_type: "Case",
          entity_id: complaint.case.case_id,
          old_status: oldCaseStatus,
          new_status: newStatus,
          description: "Case forwarded to zone/city",
        },
        { transaction: t }
      );

    } else {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "assign_to must be 'expert' or 'zone/city'",
      });
    }

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Assignment completed successfully",
    });

  } catch (err) {
    await t.rollback();
    console.error("assignToHierarchy error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
   // Zone Admin – Pull next complaint
   
exports.getComplaintForZoneAdmin = async (req, res) => {
  const admin_id = req.user.id;

  if (!req.user.permissions.includes("zone:can-get-complaint")) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  let { page = 1, limit = 10, status } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  const t = await sequelize.transaction();
  try {
    const admin = await AdministratorAccounts.findOne({
      where: { user_id: admin_id },
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
              include: [
                { model: Zone, as: "zone" },
                { model: Subcity, as: "subcity" },
              ],
            },
          ],
        },
      ],
      transaction: t,
    });
    const hierarchy = admin?.hierarchies?.[0]?.hierarchy;
    const zone_id = hierarchy?.zone?.zone_id || null;
    const subcity_id = hierarchy?.subcity?.subcity_id || null;
    if (!zone_id && !subcity_id) {
      throw new Error("No zone or subcity assigned to this admin");
    }
console.log("adminadmin",admin)
console.log("subcity_idsubcity_id",subcity_id)
    const complaintWhere = {
      handling_unit: "regional_team",
    };

    if (zone_id) {
      complaintWhere.zone_id = zone_id;
    } else if (subcity_id) {
      complaintWhere.subcity_id = subcity_id;
    }

    const caseStatusWhere = {
      status: {
        [Op.in]: [
          "assigned_to_zone/city",
          "assigned_to_woreda",
          "Authorized",
          "assigned_to_woreda_expert",
          "assigned_to_zone_expert",
          "investigation_submitted",
          "Closed"
        ],
      },
    };

    if (status) {
      const statusArray = status.split(",");
      caseStatusWhere.status =
        statusArray.length > 1
          ? { [Op.in]: statusArray }
          : statusArray[0];
    }

    // 4️⃣ Fetch complaints
    const complaints = await Complaint.findAll({
      where: complaintWhere,
      include: [
        {
          model: Case,
          as: "case",
          required: true,
          where: caseStatusWhere,
        },
        { model: ComplaintAttachement, as: "attachments" },
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
      limit,
      offset,
      transaction: t,
    });

    await t.commit();

    return res.status(200).json({
      success: true,
      page,
      limit,
      count: complaints.length,
      complaints,
    });

  } catch (err) {
    await t.rollback();
    console.error("getComplaintForZoneAdmin error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

   
exports.assignToLowerHierarchy = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { complaint_id, assign_to, case_status, expert_id } = req.body;
    const admin_id = req.user.id;
    if (!req.user.permissions.includes("zone:can-assign")) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const admin = await AdministratorAccounts.findOne({
      where: { user_id: admin_id },
      include: [
        {
          model: userHasHierarchy,
          as: "hierarchies",
          include: [
            {
              model: organizationHierarchy,
              as: "hierarchy",
              include: [
                { model: Zone, as: "zone" },
                { model: Subcity, as: "subcity" },
              ],
            },
          ],
        },
      ],
      transaction: t,
    });

    const hierarchy = admin?.hierarchies?.[0]?.hierarchy;
    const adminZoneId = hierarchy?.zone?.zone_id || null;
    const adminSubcityId = hierarchy?.subcity?.subcity_id || null;

    if (!adminZoneId && !adminSubcityId) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Admin has no zone or subcity assigned",
      });
    }

    // 2️⃣ Fetch complaint + case
    const complaint = await Complaint.findByPk(complaint_id, {
      include: [
        { model: Case, as: "case" },
        { model: Zone, as: "zone" },
        { model: Subcity, as: "subcity" },
        { model: SubPollutionCategory, as: "sub_pollution_category" },
      ],
      transaction: t,
    });

    if (!complaint || !complaint.case) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Complaint or case not found",
      });
    }

    // 3️⃣ Ownership validation
    if (adminZoneId && complaint.zone_id !== adminZoneId) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "You cannot assign complaints outside your zone",
      });
    }

    if (!adminZoneId && adminSubcityId && complaint.subcity_id !== adminSubcityId) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "You cannot assign complaints outside your subcity",
      });
    }

    const oldCaseStatus = complaint.case.status;

    // 4️⃣ Assign to expert
    if (assign_to === "expert") {
      if (!expert_id) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "expert_id is required",
        });
      }

      let investigation_days = parseInt(
        complaint.sub_pollution_category?.investigation_days,
        10
      );
      if (isNaN(investigation_days) || investigation_days <= 0) {
        investigation_days = 14;
      }

      // Do NOT start countdown here; start when expert opens the case
      await ExpertCase.create(
        {
          expert_case_id: uuidv4(),
          user_id: expert_id,
          case_id: complaint.case.case_id,
          created_by: admin_id,
        },
        { transaction: t }
      );

      await complaint.case.update(
        {
          status: case_status || "assigned_to_expert",
          status_changed_by: admin_id,
          countdown_start_date: null,
          countdown_end_date: null,
          is_opened: false,
        },
        { transaction: t }
      );

      await complaint.update(
        { status: "under_investigation" },
        { transaction: t }
      );


      await ActivityLog.create(
        {
          user_id: admin_id,
          entity_type: "Case",
          entity_id: complaint.case.case_id,
          old_status: oldCaseStatus,
          new_status: case_status,
          description: `Case assigned to expert ${expert_id}. Investigation days: ${investigation_days}`,
        },
        { transaction: t }
      );

    // 5️⃣ Assign to lower hierarchy (zone → woreda OR subcity → woreda)
    } else {

      await complaint.case.update(
        {
          status: assign_to,
          status_changed_by: admin_id,
        },
        { transaction: t }
      );

      await ActivityLog.create(
        {
          user_id: admin_id,
          entity_type: "Case",
          entity_id: complaint.case.case_id,
          old_status: oldCaseStatus,
          new_status: assign_to,
          description: "Case forwarded to lower hierarchy",
        },
        { transaction: t }
      );

    } 
   

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Assignment successful",
    });

  } catch (err) {
    await t.rollback();
    console.error("assignToLowerHierarchy error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

   
exports.getComplaintForWoredaAdmin = async (req, res) => {
   const admin_id = req.user.id;

  if (!req.user.permissions.includes("woreda:can-get-complaint")) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const t = await sequelize.transaction();
  try {
 const admin = await AdministratorAccounts.findOne({
      where: { user_id: admin_id },
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
              include: [{ model: Woreda, as: "woreda", required: true }],
            },
          ],
        },
      ],
      transaction: t,
    });
    const woreda_id = admin?.hierarchies?.[0]?.hierarchy?.woreda?.woreda_id;


    if (!woreda_id) throw new Error("woreda not assigned");

    const complaint = await Complaint.findAll({
   where: {
  woreda_id: woreda_id,
  "$case.status$": {
    [Op.in]: ["assigned_to_woreda", "assigned_to_woreda_expert","Closed","Authorized"],
  },
},
      include: [
        { model: Case, as: "case" },
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
      transaction: t,
    });

    if (!complaint) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "No pending woreda complaints" });
    }
    return res.status(200).json({ success: true, complaint });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignToWoredaExpert = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { complaint_id, organization_hierarchy_id, expert_id, case_status } = req.body;
    const admin_id = req.user.id;

    // Permission check
    if (!req.user.permissions.includes("woreda:can-assign-to-expert")) {
      await t.rollback();
      return res.status(403).json({ message: "Forbidden" });
    }

    const admin = await AdministratorAccounts.findOne({
      where: { user_id: admin_id },
      transaction: t,
    });

    if (!admin) {
      await t.rollback();
      return res.status(404).json({ message: "Admin not found" });
    }

    const complaint = await Complaint.findByPk(complaint_id, {
      include: [
        { model: Case, as: "case" },
        { model: Woreda, as: "woreda" },
        { model: SubPollutionCategory, as: "sub_pollution_category" },
      ],
      transaction: t,
    });

    if (!complaint || !complaint.case) {
      await t.rollback();
      return res.status(404).json({ message: "Complaint or case not found" });
    }

    // Validate expert hierarchy
    const expertHierarchy = await userHasHierarchy.findOne({
      where: { user_id: expert_id, organization_hierarchy_id },
      transaction: t,
    });

    if (!expertHierarchy) {
      await t.rollback();
      return res.status(400).json({
        message: "Expert does not belong to the selected hierarchy",
      });
    }

    // Prevent duplicate assignment
    const existingAssignment = await ExpertCase.findOne({
      where: { case_id: complaint.case.case_id },
      transaction: t,
    });

    if (existingAssignment) {
      await t.rollback();
      return res.status(400).json({
        message: "Case already assigned to an expert",
      });
    }

    // ✅ Create ExpertCase ONLY ONCE
    await ExpertCase.create(
      {
        expert_case_id: uuidv4(),
        user_id: expert_id,
        case_id: complaint.case.case_id,
        created_by: admin_id,
      },
      { transaction: t }
    );

    // Investigation days
    let investigation_days = parseInt(
      complaint.sub_pollution_category?.investigation_days,
      10
    );

    if (isNaN(investigation_days) || investigation_days <= 0) {
      investigation_days = 14;
    }

    const old_case_status = complaint.case.status;

    await complaint.case.update(
      {
        status: case_status,
        status_changed_by: expert_id,
        countdown_start_date: null,
        countdown_end_date: null,
        is_opened: false,
      },
      { transaction: t }
    );

    await ActivityLog.create(
      {
        user_id: expert_id,
        entity_type: "Case",
        entity_id: complaint.case.case_id,
        old_status: old_case_status,
        new_status: case_status,
        description: `Case assigned to expert ${expert_id}. Investigation days: ${investigation_days}`,
      },
      { transaction: t }
    );

    await complaint.update(
      { status: "under_investigation" },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).json({ success: true });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

   //  Regional Expert – Get NEXT assigned case (FIFO) 
  
exports.getCaseForRegionalExpert = async (req, res) => {
  const expert_id = req.user.id;
  const { complaint_id } = req.params;

  if (!req.user.permissions.includes("expert:can-get-case")) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    // expert can have many cases
    const baseWhere = { user_id: expert_id };
    let order = [[{ model: Case, as: "case" }, "created_at", "ASC"]];

    if (complaint_id) {
      const c = await Case.findOne({ where: { complaint_id } });
      if (!c) return res.status(404).json({ message: "Complaint not found" });
      baseWhere.case_id = c.case_id;
      order = []; // exact match → no ordering needed
    }

    const assignments = await ExpertCase.findAll({
      where: baseWhere,
      include: [{
        model: Case,
        as: "case",
        where: { status: { [Op.like]: "%_expert" } },
        include: [{
          model: Complaint,
          as: "complaint",
          include: [
            { model: ComplaintAttachement, as: "attachments" },
            { model: Woreda, as: "woreda" },
            { model: Zone, as: "zone" },
            { model: Region, as: "region" },
            { model: CustomerAccount, as: "customer" },
            { model: AdministratorAccounts, as: "acceptedBy" },
            { model: PollutionCategory, as: "pollution_category" },
            { model: SubPollutionCategory, as: "sub_pollution_category" },
          ],
        }],
      }],
      order,
    });

    if (assignments.length === 0) {
      return res.status(404).json({ success: false, message: "No assigned case" });
    }

    // Take the first (oldest) if multiple
    const assignment = assignments[0];
    const caseRecord = assignment.case;
    const complaint = caseRecord.complaint;

   

    // Update complaint status
    if (complaint.status === "Verified") {
      await complaint.update({ status: "under_investigation" });
      await ActivityLog.create({
        user_id: expert_id,
        entity_type: "Complaint",
        entity_id: complaint.complaint_id,
        old_status: "Verified",
        new_status: "under_investigation",
        description: "Investigation started by regional expert",
      });
    }

    const data = caseRecord.get({ plain: true });
    data.complaint = complaint.get({ plain: true });
    data.remaining_days = calculateRemainingDays(data);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("getCaseForRegionalExpert:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


   // List ALL assigned cases for the expert 
 
exports.getAssignedRegionalCases = async (req, res) => {
  const expert_id = req.user.id;

  try {
    const assignments = await ExpertCase.findAll({
      where: { user_id: expert_id },
      include: [
        {
          model: Case,
          as: "case",
          include: [
            {
              model: Complaint,
              as: "complaint",
              include: [
                { model: ComplaintAttachement, as: "attachments" },
                { model: Woreda, as: "woreda" },
                { model: Zone, as: "zone" },
                { model: Region, as: "region" },
                { model: CustomerAccount, as: "customer" },
                { model: AdministratorAccounts, as: "acceptedBy" },
                { model: PollutionCategory, as: "pollution_category" },
                { model: SubPollutionCategory, as: "sub_pollution_category" },
              ],
            },
          ],
        },
      ],
      order: [[{ model: Case, as: "case" }, "created_at", "DESC"]],
    });

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
                {
                  model: SubPollutionCategory,
                  as: "sub_pollution_category",
                  include: [{ model: ReportType, as: "report_types" }],
                },
              ],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // 🔹 Combine ExpertCase + TeamCase
    const allCases = [
      ...assignments.map(ec => ec.case.get({ plain: true })),
      ...teamResult.map(tc => tc.case.get({ plain: true })),
    ].map(c => ({
      ...c,
      remaining_days: calculateRemainingDays(c),
    }));

    return res.status(200).json({
      success: true,
      count: allCases.length,
      data: allCases,
    });

  } catch (err) {
    console.error("getAssignedRegionalCases:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



   // Review Investigation 
   
exports.reviewRegionalInvestigation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { case_id, status, rejection_reason_id } = req.body;
    const admin_id = req.user.id;

    if (!req.user.permissions.includes("region:can-review-investigation")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!["approved_by_region_admin", "rejected_by_region_admin"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const caseRecord = await Case.findByPk(case_id, {
      include: [
        { model: Complaint, as: "complaint", include: [{ model: Region, as: "region" }] },
        { model: CaseInvestigation, as: "case_investigation" },
      ],
      transaction: t,
    });

    if (!caseRecord) {
      await t.rollback();
      return res.status(404).json({ message: "Case not found" });
    }

    const admin = await AdministratorAccounts.findOne({ where: { user_id: admin_id }, transaction: t });
    if (caseRecord.complaint.region_id !== admin.region_id) {
      await t.rollback();
      return res.status(403).json({ message: "Not your region" });
    }

    // Find the final investigation
    const finalInvestigation = caseRecord.case_investigation?.find(i => i.status === "final");
    if (!finalInvestigation || caseRecord.status !== "investigation_submitted") {
      await t.rollback();
      return res.status(400).json({ message: "Investigation not ready for review" });
    }

    await finalInvestigation.update({ status, updated_by: admin_id }, { transaction: t });
    await caseRecord.update({
      status: status === "approved_by_region_admin" ? "approved_regional" : "rejected_regional",
    }, { transaction: t });

    await ActivityLog.create({
      user_id: admin_id,
      entity_type: "Case",
      entity_id: case_id,
      description: `Regional review: ${status}`,
      rejection_reason_id: rejection_reason_id || null,
    }, { transaction: t });

    await t.commit();
    return res.status(200).json({ success: true, message: "Review completed" });
  } catch (err) {
    await t.rollback();
    console.error("reviewRegionalInvestigation:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


  // Reused functions
  
exports.submitRegionalInvestigation = submitInvestigation;
exports.deleteRegionalAttachment = deleteAttachment;

exports.openRegionalCase = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const expert_id = req.user.id;

    if (!req.user.permissions.includes("expert:can-get-case")) {
      await t.rollback();
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const expertAssignment = await ExpertCase.findOne({
      where: { user_id: expert_id },
      include: [
        {
          model: Case,
          as: "case",
          where: { is_opened: false },
        },
      ],
      order: [["created_at", "ASC"]],
      transaction: t,
    });

    if (!expertAssignment || !expertAssignment.case) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "No unopened assigned case found",
      });
    }

    const caseId = expertAssignment.case.case_id;

    const caseRecord = await Case.findByPk(caseId, {
      transaction: t,
      include: [
        {
          model: Complaint,
          as: "complaint",
          include: [{ model: SubPollutionCategory, as: "sub_pollution_category" }],
        },
      ],
    });

    let investigation_days = parseInt(
      caseRecord.complaint?.sub_pollution_category?.investigation_days,
      10
    );
    if (!investigation_days || investigation_days <= 0) investigation_days = 14;

    const countdown_start = new Date();
    const countdown_end = addDays(countdown_start, investigation_days);

    await caseRecord.update(
      {
        is_opened: true,
        opened_at: countdown_start,
        countdown_start_date: countdown_start,
        countdown_end_date: countdown_end,
      },
      { transaction: t }
    );

    await ActivityLog.create(
      {
        user_id: expert_id,
        entity_type: "Case",
        entity_id: caseRecord.case_id,
        description: `Expert opened the case. Countdown started for ${investigation_days} day(s).`,
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({ success: true, data: caseRecord });
  } catch (err) {
    await t.rollback();
    console.error("openRegionalCase:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.countUnopenedRegionalCases = async (req, res) => {
  try {
    const expert_id = req.user.id;

    if (!req.user.permissions.includes("expert:can-get-case")) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const assignments = await ExpertCase.findAll({
      where: { user_id: expert_id },
      include: [{ model: Case, as: 'case', where: { status: { [Op.like]: '%_expert' }, is_opened: false } }]
    });

    console.log("assignmentssss",assignments)
    return res.status(200).json({ success: true, count: assignments.length });
  } catch (err) {
    console.error('countUnopenedRegionalCases:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = exports;