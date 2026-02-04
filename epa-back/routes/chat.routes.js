const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');

router.use(verifyToken);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/chat_attachments/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Create a new chat
router.post('/', upload.array('files', 5), chatController.createChat);

// Get all chats for a complaint
router.get('/complaint/:complaint_id', chatController.getChatsByComplaint);

// Get all chats assigned to current user
router.get('/assigned', chatController.getAssignedChats);

// Get chats where current user is participant
router.get('/my-participating', chatController.getMyParticipatingChats);

// Get chat statistics
router.get('/statistics', chatController.getChatStatistics);

// Get chat details with messages
router.get('/:chat_id', chatController.getChatDetails);

// Send a message to a chat
router.post('/:chat_id/messages', upload.array('files', 5), chatController.sendMessage);

// Update chat status
router.patch('/:chat_id/status', chatController.updateChatStatus);

// Respond to extension request
router.post('/:chat_id/respond-extension', chatController.respondToExtension);

// Add participant to chat
router.post('/:chat_id/participants', chatController.addParticipant);

// Moderate a message
router.delete('/:chat_id/messages/:message_id', chatController.moderateMessage);

// Respond to issue request
router.post('/issue/:chat_id/reassign', chatController.respondToIssue);

// Reject issue
router.post('/:chat_id/reject', chatController.respondToIssue);


module.exports = router;
