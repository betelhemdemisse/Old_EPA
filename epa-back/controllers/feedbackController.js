const {
  Feedback,
  Case,
  AdministratorAccounts,
  ExpertCase,
  Complaint,
  Region,
  City,
  Subcity,
  Zone,
  Woreda,
  PollutionCategory,
  SubPollutionCategory,
  CustomerAccount,
  ComplaintAttachement,
  Sequelize,
} = require('../models');
const { v4: uuidv4 } = require("uuid");

const nodemailer = require('nodemailer');
const { Op } = Sequelize;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const submitFeedback = async (req, res) => {
  try {
    const { case_id, comment } = req.body;
    const user_id = req.user.id;

    const caseData = await Case.findOne({
      where: { case_id },
      include: [
        {
          model: ExpertCase,
          as: 'expertCase',
          include: [{ model: AdministratorAccounts, as: 'user' }],
        },
      ],
    });

    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
console.log(caseData.status , "caseData status ")
 const allowedStatuses = [
  'assigned_to_expert',
  'under_investigation',
  'assigned_to_woreda_expert',
  'assigned_to_regional_expert',
  'assigned_to_zone_city_expert',
  'assigned_to_zone_expert'
];

if (!allowedStatuses.includes(caseData.status)) {
  return res.status(400).json({
    success: false,
    message: 'Feedback can only be submitted for cases with status assigned_to_expert, under_investigation, assigned_to_woreda_expert, assigned_to_regional_expert, or assigned_to_zone_city_expert',
  });
}

const feedback_id =uuidv4()
    const feedback = await Feedback.create({
      feedback_id,
      case_id,
      user_id,
      stamp_date: new Date(),
      comment,
      created_by: user_id,
    });

    if (caseData.expertCase && caseData.expertCase.user) {
      const expertEmail = caseData.expertCase.user.email;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: expertEmail,
        subject: 'New Feedback Submitted for Case',
        text: `A new feedback has been submitted for case ${caseData.case_no}.\n\nComment: ${comment}\n\nSubmitted by: ${req.user.name}\n\nPlease review the feedback.`,
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getFeedbackByCase = async (req, res) => {
  try {
    const { case_id } = req.params;
console.log("case_idcase_id",case_id)
    const caseRecord = await Case.findByPk(case_id, {
      include: [
        {
          model: Complaint,
          as: 'complaint',
          include: [
            { model: Region, as: 'region' },
            { model: City, as: 'city' },
            { model: Subcity, as: 'subcity' },
            { model: Zone, as: 'zone' },
            { model: Woreda, as: 'woreda' },
            { model: PollutionCategory, as: 'pollution_category' },
            { model: SubPollutionCategory, as: 'sub_pollution_category' },
            { model: CustomerAccount, as: 'customer' },
            { model: AdministratorAccounts, as: 'acceptedBy' },
            { model: ComplaintAttachement, as: 'attachments' },
          ],
        },
        {
          model: ExpertCase,
          as: 'expertCase',
          include: [
            { model: AdministratorAccounts, as: 'user' },
          ],
        },
        { model: AdministratorAccounts, as: 'statusChanger' },
        { model: AdministratorAccounts, as: 'extender' },
        { model: AdministratorAccounts, as: 'creator' },
      ],
    });

    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const feedbacks = await Feedback.findAll({
      where: { case_id },
      include: [
        { model: AdministratorAccounts, as: 'user'},
        { model: AdministratorAccounts, as: 'creator' },
        { model: AdministratorAccounts, as: 'updater', required: false },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        case: caseRecord,
        feedbacks,
      },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { feedback_id } = req.params;
    const { comment } = req.body;
    const currentUserId = req.user.user_id;

    if (!comment?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }

    const feedback = await Feedback.findOne({
      where: { feedback_id },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['status', 'case_no'],
          include: [
            {
              model: ExpertCase,
              as: 'expertCase',
              include: [{ model: AdministratorAccounts, as: 'user' }],
            },
          ],
        },
      ],
    });

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (feedback.created_by !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this feedback',
      });
    }

    if (feedback.case?.status === 'authorized') {
      return res.status(403).json({
        success: false,
        message: 'Feedback cannot be edited when case status is "authorized"',
      });
    }

    feedback.comment = comment.trim();
    feedback.updated_by = currentUserId;
    feedback.updated_at = new Date();
    await feedback.save();

    if (feedback.case?.expertCase?.user?.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: feedback.case.expertCase.user.email,
        subject: `Feedback Updated for Case ${feedback.case.case_no}`,
        text: `Feedback has been updated.\n\nNew comment: ${comment}\n\nUpdated by: ${req.user.name}`,
      };
      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback,
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackByCase,
  updateFeedback,
};