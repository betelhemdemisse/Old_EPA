const db = require('../models');
const { Op, sequelize } = require('sequelize'); // Added sequelize import
const { sendRealtimeNotification } = require('../app');
const { v4: uuidv4 } = require("uuid");

const { Chat, Message, userHasHierarchy ,organizationHierarchy , AdministratorAccounts, ChatParticipant, Complaint, CustomerAccount, Case, ExpertCase } = require('../models');



exports.createChat = async (req, res) => {
  try {
    const {
      complaint_id,
      type,
      content,
      title,
      severity,
      new_deadline,
      days_requested
    } = req.body;

    const userId = req.user?.id || req.body.user_id;

    if (!complaint_id || !type) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID and type are required'
      });
    }

    /* ----------------------------------------
       1️⃣ Fetch complaint
    ---------------------------------------- */
    const complaint = await Complaint.findByPk(complaint_id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    /* ----------------------------------------
       2️⃣ Get logged-in user hierarchy
    ---------------------------------------- */
    const userHierarchy = await userHasHierarchy.findOne({
      where: { user_id: userId },
      include: [
        {
          model: organizationHierarchy,
          as: 'hierarchy',
          include: [
            { model: organizationHierarchy, as: 'parent' },
            { model: organizationHierarchy, as: 'children' }
          ]
        }
      ]
    });

    if (!userHierarchy || !userHierarchy.hierarchy) {
      return res.status(403).json({
        success: false,
        message: 'User has no hierarchy'
      });
    }

    const hierarchy = userHierarchy.hierarchy;
    console.log('User hierarchy:', hierarchy);  
    const isLeaf = !hierarchy.children || hierarchy.children.length === 0;
    console.log('User hierarchy parent id:', hierarchy.parent_id);  
    console.log('Is leaf user:', isLeaf);
    /* ----------------------------------------
       3️⃣ Enforce rules
    ---------------------------------------- */
    if (isLeaf && !['issue', 'extension'].includes(type)) {
      return res.status(403).json({
        success: false,
        message: 'Leaf users can only raise issue or extension'
      });
    }

    if (!isLeaf && type !== 'feedback') {
      return res.status(403).json({
        success: false,
        message: 'Higher hierarchy users can only send feedback'
      });
    }

    /* ----------------------------------------
       4️⃣ Resolve receivers
    ---------------------------------------- */
    let receiverUserIds = [];

    if (isLeaf) {
      if (!hierarchy.parent_id) {
        return res.status(403).json({
          success: false,
          message: 'No parent hierarchy found'
        });
      }

      const parentUsers = await userHasHierarchy.findAll({
        where: { organization_hierarchy_id: hierarchy.parent_id }
      });
      console.log('Parent users:', parentUsers);

      receiverUserIds = parentUsers.map(u => u.user_id);
    } else {
      const childHierarchyIds = hierarchy.children.map(c => c.organization_hierarchy_id);

      const childUsers = await userHasHierarchy.findAll({
        where: { organization_hierarchy_id: childHierarchyIds }
      });

      receiverUserIds = childUsers.map(u => u.user_id);
    }

    // if (receiverUserIds.length === 0) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'No receivers found'
    //   });
    // }

    /* ----------------------------------------
       5️⃣ Create Chat
    ---------------------------------------- */
    const chat = await Chat.create({
      chat_id: uuidv4(),
      complaint_id,
      title: title || `${type.toUpperCase()} Request`,
      type,
      receiver_id: receiverUserIds[0]||null,
      receiver_type: isLeaf ? 'admin' : 'expert',
      assigned_to: receiverUserIds,
      reason: content || '',
      priority: severity || 'medium',
      requested_extension: type === 'extension' ? new_deadline : null,
      days_requested: type === 'extension' ? days_requested : null,
      status: type === 'extension' ? 'pending_review' : 'active'
    });

    /* ----------------------------------------
       6️⃣ Add participants
    ---------------------------------------- */
    // Creator
    await ChatParticipant.create({
      chat_participant_id: uuidv4(),
      chat_id: chat.chat_id,
      user_id: userId,
      role: 'initiator' // matches ENUM: initiator | participant | moderator
    });

    // Receivers
    for (const receiverId of receiverUserIds) {
      await ChatParticipant.create({
        chat_participant_id: uuidv4(),
        chat_id: chat.chat_id,
        user_id: receiverId,
        role: 'participant' // matches ENUM
      });
    }

    /* ----------------------------------------
       7️⃣ Create initial message
    ---------------------------------------- */
    await Message.create({
      message_id: uuidv4(),
      chat_id: chat.chat_id,
      sender_id: userId,
      content: content || '',
      type // ensure Message.type ENUM includes 'feedback', 'issue', 'extension'
    });

    return res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: chat
    });

  } catch (error) {
    console.error('Create chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message
    });
  }
};



// Get all chats for a complaint (NO receiver logic)
exports.getChatsByComplaint = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const userId = req.user?.id;

    if (!complaint_id) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID is required'
      });
    }

    const chats = await Chat.findAll({
      where: { complaint_id },
      include: [
        {
          model: Message,
          as: 'messages',
          separate: true,
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [
            {
              model: AdministratorAccounts,
              as: 'sender',
              attributes: ['user_id', 'name', 'email']
            }
          ]
        },
        {
          model: Complaint,
          as: 'complaint',
          attributes: ['complaint_id', 'status']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      data: chats,
      user_id: userId
    });

  } catch (error) {
    console.error('Get chats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
};


// Get all chats assigned to current user
exports.getAssignedChats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { status, type, complaint_id } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Build where clause
    const whereClause = {
      [Op.or]: [
        { receiver_id: userId },
        { 
          assigned_to: {
            [Op.contains]: [userId]
          }
        }
      ]
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (type && type !== 'all') {
      whereClause.type = type;
    }

    if (complaint_id) {
      whereClause.complaint_id = complaint_id;
    }

    const assignedChats = await Chat.findAll({
      where: whereClause,
      include: [
        {
          model: AdministratorAccounts,
          as: 'participants',
          attributes: ['user_id', 'name', 'email'],
          through: { attributes: [] }
        },
        {
          model: AdministratorAccounts,
          foreignKey: 'receiver_id',
          as: 'receiver',
          attributes: ['user_id', 'name', 'email']
        },
        {
          model: Message,
          as: 'messages',
          include: [
            {
              model: AdministratorAccounts,
              as: 'sender',
              attributes: ['user_id', 'name', 'email']
            }
          ],
          limit: 1,
          order: [['created_at', 'DESC']]
        },
        {
          model: Complaint,
          as: 'complaint',
          attributes: ['complaint_id', 'title', 'status', 'deadline'],
          include: [
            {
              model: AdministratorAccounts,
              as: 'acceptedBy',
              attributes: ['user_id', 'name', 'email']
            },
            {
              model: CustomerAccount,
              as: 'customer',
              attributes: ['user_id', 'name', 'email']
            }
          ]
        }
      ],
      order: [
        ['status', 'ASC'],
        ['priority', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    // Group by complaint if requested
    const groupByComplaint = req.query.group_by === 'complaint';
    let resultData = assignedChats;
    
    if (groupByComplaint) {
      const groupedByComplaint = assignedChats.reduce((acc, chat) => {
        const complaintId = chat.complaint_id;
        if (!acc[complaintId]) {
          acc[complaintId] = {
            complaint: chat.complaint,
            chats: []
          };
        }
        acc[complaintId].chats.push(chat);
        return acc;
      }, {});
      
      resultData = Object.values(groupedByComplaint);
    }

    res.json({
      success: true,
      data: resultData,
      count: assignedChats.length
    });

  } catch (error) {
    console.error('Get assigned chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned chats',
      error: error.message
    });
  }
};

// Get chats where current user is a participant
exports.getMyParticipatingChats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { status, type } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const participantRecords = await ChatParticipant.findAll({
      where: { user_id: userId },
      attributes: ['chat_id']
    });

    const chatIds = participantRecords.map(record => record.chat_id);

    if (chatIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }

    const whereClause = {
      chat_id: { [Op.in]: chatIds }
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (type && type !== 'all') {
      whereClause.type = type;
    }

    const chats = await Chat.findAll({
      where: whereClause,
      include: [
        {
          model: AdministratorAccounts,
          as: 'participants',
          attributes: ['user_id', 'name', 'email'],
          through: { attributes: [] }
        },
        {
          model: AdministratorAccounts,
          foreignKey: 'receiver_id',
          as: 'receiver',
          attributes: ['user_id', 'name', 'email']
        },
        {
          model: Message,
          as: 'messages',
          include: [
            {
              model: AdministratorAccounts,
              as: 'sender',
              attributes: ['user_id', 'name', 'email']
            }
          ],
          limit: 1,
          order: [['created_at', 'DESC']]
        },
        {
          model: Complaint,
          as: 'complaint',
          attributes: ['complaint_id', 'title', 'status']
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    res.json({
      success: true,
      data: chats,
      count: chats.length
    });

  } catch (error) {
    console.error('Get my participating chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participating chats',
      error: error.message
    });
  }
};

// Get chat statistics
exports.getChatStatistics = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get total assigned chats
    const totalAssigned = await Chat.count({
      where: {
        [Op.or]: [
          { receiver_id: userId },
          { 
            assigned_to: {
              [Op.contains]: [userId]
            }
          }
        ]
      }
    });

    // Get pending review
    const pendingReview = await Chat.count({
      where: {
        status: 'pending_review',
        [Op.or]: [
          { receiver_id: userId },
          { 
            assigned_to: {
              [Op.contains]: [userId]
            }
          }
        ]
      }
    });

    // Get active assigned chats
    const activeAssigned = await Chat.count({
      where: {
        status: 'active',
        [Op.or]: [
          { receiver_id: userId },
          { 
            assigned_to: {
              [Op.contains]: [userId]
            }
          }
        ]
      }
    });

    // Get chats by type
    const byType = await Chat.findAll({
      where: {
        [Op.or]: [
          { receiver_id: userId },
          { 
            assigned_to: {
              [Op.contains]: [userId]
            }
          }
        ]
      },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('chat_id')), 'count']
      ],
      group: ['type']
    });

    // Get participant chats
    const participantChats = await ChatParticipant.count({
      where: { user_id: userId }
    });

    res.json({
      success: true,
      data: {
        total_assigned: totalAssigned,
        pending_review: pendingReview,
        active_assigned: activeAssigned,
        by_type: byType,
        participant_chats: participantChats
      }
    });

  } catch (error) {
    console.error('Get chat statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat statistics',
      error: error.message
    });
  }
};

// Get chat details
exports.getChatDetails = async (req, res) => {
  try {
    const { chat_id } = req.params;
    const userId = req.user?.id;

    if (!chat_id) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required'
      });
    }

    const chat = await Chat.findByPk(chat_id, {
      include: [
        {
          model: AdministratorAccounts,
          as: 'participants',
          attributes: ['user_id', 'name', 'email'],
          through: { attributes: [] }
        },
        {
          model: Message,
          as: 'messages',
          include: [
            {
              model: AdministratorAccounts,
              as: 'sender',
              attributes: ['user_id', 'name', 'email']
            }
          ],
          order: [['created_at', 'ASC']]
        },
        {
          model: Complaint,
          as: 'complaint',
          attributes: ['complaint_id', 'title', 'status']
        }
      ]
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = await ChatParticipant.findOne({
      where: { chat_id, user_id: userId }
    });

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this chat'
      });
    }

    res.json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error('Get chat details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat details',
      error: error.message
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chat_id } = req.params;
    const { content, type } = req.body;
    const userId = req.user?.id;

    if (!chat_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and content are required'
      });
    }

    const participant = await ChatParticipant.findOne({
      where: { chat_id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    const chat = await Chat.findByPk(chat_id);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.status !== 'active' && chat.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send messages to a closed chat'
      });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
    }

    const message = await Message.create({
      message_id: uuidv4(),
      chat_id,
      sender_id: userId,
      content,
      type: type || 'text',
      attachments: attachments.length > 0 ? JSON.stringify(attachments) : null
    });

    const messageWithSender = await Message.findByPk(message.message_id, {
      include: [
        {
          model: AdministratorAccounts,
          as: 'sender',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });

    await Chat.update(
      { updated_at: new Date() },
      { where: { chat_id } }
    );

    const participants = await ChatParticipant.findAll({
      where: { chat_id },
      attributes: ['user_id']
    });

    const participantIds = participants
      .map(p => p.user_id)
      .filter(id => id !== userId);

    participantIds.forEach(participantId => {
      if (sendRealtimeNotification) {
        sendRealtimeNotification(participantId, {
          type: 'new_message',
          chat_id,
          message: messageWithSender
        });
      }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messageWithSender
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Update chat status
exports.updateChatStatus = async (req, res) => {
  try {
    const { chat_id } = req.params;
    const { status, requested_extension, original_deadline } = req.body;
    const userId = req.user?.id;

    if (!chat_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and status are required'
      });
    }

    const participant = await ChatParticipant.findOne({
      where: { 
        chat_id, 
        user_id: userId,
        role: { [Op.in]: ['initiator', 'moderator', 'receiver'] }
      }
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this chat'
      });
    }

    const updateData = { 
      status,
      updated_at: new Date()
    };
    
    if (requested_extension) updateData.requested_extension = requested_extension;
    if (original_deadline) updateData.original_deadline = original_deadline;

    await Chat.update(updateData, { where: { chat_id } });

    await Message.create({
      message_id: uuidv4(),
      chat_id,
      sender_id: userId,
      content: `Chat status changed to: ${status}`,
      type: 'system'
    });

    const participants = await ChatParticipant.findAll({
      where: { chat_id },
      attributes: ['user_id']
    });

    participants.forEach(p => {
      if (sendRealtimeNotification) {
        sendRealtimeNotification(p.user_id, {
          type: 'chat_status_updated',
          chat_id,
          status
        });
      }
    });

    res.json({
      success: true,
      message: 'Chat status updated successfully'
    });

  } catch (error) {
    console.error('Update chat status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat status',
      error: error.message
    });
  }
};

// Add participant to chat
exports.addParticipant = async (req, res) => {
  try {
    const { chat_id } = req.params;
    const { user_id, role } = req.body;
    const userId = req.user?.id;

    if (!chat_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and user ID are required'
      });
    }

    const requester = await ChatParticipant.findOne({
      where: { 
        chat_id, 
        user_id: userId,
        role: { [Op.in]: ['initiator', 'moderator'] }
      }
    });

    if (!requester) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add participants'
      });
    }

    const userExists = await AdministratorAccounts.findByPk(user_id);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingParticipant = await ChatParticipant.findOne({
      where: { chat_id, user_id }
    });

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant in this chat'
      });
    }

    await ChatParticipant.create({
      chat_participant_id: uuidv4(),
      chat_id,
      user_id,
      role: role || 'participant'
    });

    await Message.create({
      message_id: uuidv4(),
      chat_id,
      sender_id: userId,
      content: `${userExists.name} has been added to the chat`,
      type: 'system'
    });

    if (sendRealtimeNotification) {
      sendRealtimeNotification(user_id, {
        type: 'added_to_chat',
        chat_id
      });
    }

    res.json({
      success: true,
      message: 'Participant added successfully'
    });

  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participant',
      error: error.message
    });
  }
};

// Moderate message
exports.moderateMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const { action } = req.body;
    const userId = req.user?.id;

    if (!message_id || !action) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and action are required'
      });
    }

    const message = await Message.findByPk(message_id, {
      include: [{ model: Chat, as: 'chat' }]
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const participant = await ChatParticipant.findOne({
      where: {
        chat_id: message.chat_id,
        user_id: userId,
        role: { [Op.in]: ['moderator', 'initiator'] }
      }
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to moderate this message'
      });
    }

    if (action === 'delete') {
      await message.destroy();
    } else if (action === 'hide') {
      await message.update({ is_read: true });
    }

    res.json({
      success: true,
      message: `Message ${action}d successfully`
    });

  } catch (error) {
    console.error('Moderate message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate message',
      error: error.message
    });
  }
};

// NEW: Respond to extension request
exports.respondToExtension = async (req, res) => {
  try {
    const { chat_id } = req.params;
    const { action, comments, new_deadline } = req.body;
    const userId = req.user?.id;

    if (!chat_id || !action) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and action are required'
      });
    }

    const chat = await Chat.findByPk(chat_id, {
      include: [
        {
          model: Complaint,
          as: 'complaint'
        }
      ]
    });

    if (!chat || chat.type !== 'extension') {
      return res.status(400).json({
        success: false,
        message: 'Extension request not found'
      });
    }

    // Check if user is receiver or assigned
    const isAuthorized = await ChatParticipant.findOne({
      where: {
        chat_id,
        user_id: userId,
        
        role: { [Op.in]: ['receiver', 'moderator'] }
      }
    });

    if (!isAuthorized && chat.receiver_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this extension'
      });
    }

    let newStatus = '';
    let updateData = {};

    if (action === 'approve') {
      newStatus = 'approved';
      updateData.status = 'approved';
      if (new_deadline) {
        updateData.requested_extension = new_deadline;
      }
    } else if (action === 'reject') {
      newStatus = 'rejected';
      updateData.status = 'rejected';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"'
      });
    }

    await chat.update(updateData);

    // Update case countdown_end_date if extension is approved
    if (action === 'approve') {
      const caseRecord = await Case.findOne({
        where: { complaint_id: chat.complaint_id }
      });

      if (caseRecord) {
        const currentEndDate = caseRecord.countdown_end_date;
        const extensionDays = parseInt(chat.days_requested) || 0;
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + extensionDays);
console.log("newEndDate",newEndDate)
        await Case.update(
          {
            countdown_end_date: newEndDate,
            is_extended: true,
            extended_by: userId,
            extended_days: chat.days_requested
          },
          { where: { complaint_id: chat.complaint_id } }
        );
      }
    }

    await Message.create({
      message_id: uuidv4(),
      chat_id,
      sender_id: userId,
      content: `Extension request ${action}d. ${comments || ''}`,
      type: 'system'
    });

    // Notify initiator
    const initiator = await ChatParticipant.findOne({
      where: { chat_id, role: 'initiator' }
    });

    if (initiator && sendRealtimeNotification) {
      sendRealtimeNotification(initiator.user_id, {
        type: 'extension_response',
        chat_id,
        action,
        status: newStatus
      });
    }

    res.json({
      success: true,
      message: `Extension request ${action}d`,
      data: { chat_id, status: newStatus }
    });

  } catch (error) {
    console.error('Respond to extension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to extension',
      error: error.message
    });
  }
};

// Updated respondToIssue function with reassign functionality
exports.respondToIssue = async (req, res) => {
  try {
    const { chat_id } = req.params;
    const { action, comments, updated_complaint, reassigned_to = [] } = req.body;
    const userId = req.user?.id;

    if (!chat_id || !action) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and action are required'
      });
    }

    const chat = await Chat.findByPk(chat_id, {
      include: [
        {
          model: Complaint,
          as: 'complaint'
        },
        {
          model: AdministratorAccounts,
          as: 'participants',
          attributes: ['user_id', 'name', 'email'],
          through: { attributes: [] }
        }
      ]
    });

    if (!chat || chat.type !== 'issue') {
      return res.status(400).json({
        success: false,
        message: 'Issue request not found'
      });
    }

    // Check if user is receiver or assigned (taskforce user)
    const isAuthorized = await ChatParticipant.findOne({
      where: {
        chat_id,
        user_id: userId,
        role: { [Op.in]: ['receiver', 'moderator', 'participant'] }
      }
    });

    if (!isAuthorized && chat.receiver_id !== userId && !chat.assigned_to?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this issue'
      });
    }

    let newStatus = '';
    let updateData = {};

    if (action === 'accept') {
      newStatus = 'accepted';
      updateData.status = 'accepted';

      // Set expertcase status to inactive
      const expertCase = await ExpertCase.findOne({
        where: { case_id: chat.complaint_id }
      });

      if (expertCase) {
        await ExpertCase.update(
          { status: 'inactive', updated_by: userId },
          { where: { expert_case_id: expertCase.expert_case_id } }
        );
      }
    } else if (action === 'reject') {
      newStatus = 'rejected';
      updateData.status = 'rejected';
    } else if (action === 'reassign') {
      newStatus = 'reassigned';
      updateData.status = 'reassigned';

      // Make the complaint editable by resetting certain statuses
      await Complaint.update(
        { 
          status: 'under_review',
          handling_unit: null,
          updated_at: new Date()
        },
        { where: { complaint_id: chat.complaint_id } }
      );

      // Set ALL current expert cases for this complaint to inactive
      await ExpertCase.update(
        { 
          status: 'inactive', 
          updated_by: userId,
          updated_at: new Date()
        },
        { 
          where: { 
            case_id: chat.complaint_id,
            status: 'active'
          }
        }
      );

      // If reassigned_to array is provided, create new expert cases
      if (Array.isArray(reassigned_to) && reassigned_to.length > 0) {
        for (const expertId of reassigned_to) {
          await ExpertCase.create({
            expert_case_id: uuidv4(),
            case_id: chat.complaint_id,
            user_id: expertId,
            status: 'active',
            created_by: userId,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }

      // Update complaint details if provided
      if (updated_complaint) {
        const complaintUpdateData = {};
        
        // Basic complaint details
        if (updated_complaint.detail !== undefined) complaintUpdateData.detail = updated_complaint.detail;
        if (updated_complaint.location_url !== undefined) complaintUpdateData.location_url = updated_complaint.location_url;
        if (updated_complaint.specific_address !== undefined) complaintUpdateData.specific_address = updated_complaint.specific_address;
        if (updated_complaint.pollution_category_id !== undefined) complaintUpdateData.pollution_category_id = updated_complaint.pollution_category_id;
        if (updated_complaint.subpollution_category_id !== undefined) complaintUpdateData.subpollution_category_id = updated_complaint.subpollution_category_id;
        
        // Location hierarchy - allow null values to reset
        if (updated_complaint.region_id !== undefined) complaintUpdateData.region_id = updated_complaint.region_id;
        if (updated_complaint.city_id !== undefined) complaintUpdateData.city_id = updated_complaint.city_id;
        if (updated_complaint.zone_id !== undefined) complaintUpdateData.zone_id = updated_complaint.zone_id;
        if (updated_complaint.subcity_id !== undefined) complaintUpdateData.subcity_id = updated_complaint.subcity_id;
        if (updated_complaint.woreda_id !== undefined) complaintUpdateData.woreda_id = updated_complaint.woreda_id;
        
        // Reset handling unit to make it editable
        complaintUpdateData.handling_unit = null;
        complaintUpdateData.is_team_formation_needed = null;
        complaintUpdateData.updated_at = new Date();

        if (Object.keys(complaintUpdateData).length > 0) {
          await Complaint.update(complaintUpdateData, { 
            where: { complaint_id: chat.complaint_id } 
          });
        }
      }

      // Also reset any team assignments
      await TeamCase.update(
        { status: 'inactive', updated_at: new Date() },
        { where: { complaint_id: chat.complaint_id } }
      );

      // Reset case status if it exists
      const existingCase = await Case.findOne({
        where: { complaint_id: chat.complaint_id }
      });

      if (existingCase) {
        await Case.update(
          {
            status: 'pending_assignment',
            assigned_to: null,
            assigned_at: null,
            updated_at: new Date()
          },
          { where: { case_id: existingCase.case_id } }
        );
      }

      // Add new participants if reassigned
      if (Array.isArray(reassigned_to) && reassigned_to.length > 0) {
        for (const expertId of reassigned_to) {
          const existingParticipant = await ChatParticipant.findOne({
            where: { chat_id, user_id: expertId }
          });

          if (!existingParticipant) {
            await ChatParticipant.create({
              chat_participant_id: uuidv4(),
              chat_id,
              user_id: expertId,
              role: 'participant'
            });
          }
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "accept", "reject", or "reassign"'
      });
    }

    await chat.update(updateData);

    // Create system message
    let systemMessage = `Issue request ${action}d. ${comments || ''}`;
    
    if (action === 'reassign') {
      if (reassigned_to && reassigned_to.length > 0) {
        const userNames = await AdministratorAccounts.findAll({
          where: { user_id: { [Op.in]: reassigned_to } },
          attributes: ['name']
        });
        const names = userNames.map(u => u.name).join(', ');
        systemMessage += ` Reassigned to: ${names}`;
      }
      
      if (updated_complaint) {
        systemMessage += ` Report information has been made editable.`;
      }
    }

    await Message.create({
      message_id: uuidv4(),
      chat_id,
      sender_id: userId,
      content: systemMessage,
      type: 'system'
    });

    // Notify initiator and all participants
    const participants = await ChatParticipant.findAll({
      where: { chat_id },
      attributes: ['user_id']
    });

    participants.forEach(p => {
      if (sendRealtimeNotification) {
        sendRealtimeNotification(p.user_id, {
          type: 'issue_response',
          chat_id,
          action,
          status: newStatus,
          complaint_id: chat.complaint_id
        });
      }
    });

    res.json({
      success: true,
      message: `Issue request ${action}d`,
      data: { 
        chat_id, 
        status: newStatus,
        complaint_id: chat.complaint_id,
        is_editable: action === 'reassign' // Indicate if complaint is now editable
      }
    });

  } catch (error) {
    console.error('Respond to issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to issue',
      error: error.message
    });
  }
};
