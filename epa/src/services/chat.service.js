import api from "./api";

class ChatService {
  // 1. Get all chats for a complaint
  async getChatsByComplaint(complaintId) {
    try {
      const response = await api.get(`/api/chat/complaint/${complaintId}`);
      console.log('Chats for complaint:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      throw error;
    }
  }

  // 2. Create a new chat (extension/issue/feedback request)
  async createChat(formData) {
    try {
      console.log("Creating chat with formData:", formData);
      const response = await api.post(`/api/chat`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Chat created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  }



  // In chat.service.js
 async rejectChat (chatId, reason) {
  try {
    const response = await api.post(`/chats/${chatId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Also add a reassign method
 async reassignChat (chatId, newAssigneeId)  {
  try {
    const response = await api.post(`/chats/issue/${chatId}/reassign`, { 
      new_assignee_id: newAssigneeId 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
  // 3. Approve extension request
  async approveExtension(chatId, comments, new_deadline) {
    try {
      console.log(`Approving extension for chat ${chatId} with deadline:`, new_deadline);
      const response = await api.post(`/api/chat/${chatId}/respond-extension`, {
        action: 'approve',
        comments,
        new_deadline
      });
      console.log('Extension approved response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to approve extension:', error);
      throw error;
    }
  }

  // 4. Reject extension request
  async rejectExtension(chatId, comments) {
    try {
      console.log(`Rejecting extension for chat ${chatId}`);
      const response = await api.post(`/api/chat/${chatId}/respond-extension`, {
        action: 'reject',
        comments
      });
      console.log('Extension rejected response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to reject extension:', error);
      throw error;
    }
  }

  // 5. Send a message with files to a chat
  async sendMessage(chatId, message, files = []) {
    try {
      const formData = new FormData();
      formData.append('content', message);
      formData.append('type', 'text');
      
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post(`/api/chat/${chatId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // 6. Get all chats assigned to current user
  async getAssignedChats(params = {}) {
    try {
      const response = await api.get(`/api/chat/assigned`, { params });
      console.log('Assigned chats:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch assigned chats:', error);
      throw error;
    }
  }

  // 7. Get chat details with messages
  async getChatDetails(chatId) {
    try {
      const response = await api.get(`/api/chat/${chatId}`);
      console.log('Chat details:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get chat details:', error);
      throw error;
    }
  }

  // 8. Update chat status
  async updateChatStatus(chatId, status, reason = '') {
    try {
      const response = await api.patch(`/api/chat/${chatId}/status`, {
        status,
        reason
      });
      console.log('Chat status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update chat status:', error);
      throw error;
    }
  }

  // 9. Add participant to chat
  async addParticipant(chatId, userId) {
    try {
      const response = await api.post(`/api/chat/${chatId}/participants`, {
        user_id: userId
      });
      console.log('Participant added:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to add participant:', error);
      throw error;
    }
  }

  // 10. Get chat statistics
  async getStatistics() {
    try {
      const response = await api.get(`/api/chat/statistics`);
      console.log('Chat statistics:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw error;
    }
  }

  // 11. Get my participating chats
  async getMyParticipatingChats() {
    try {
      const response = await api.get(`/api/chat/my-participating`);
      console.log('My participating chats:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get participating chats:', error);
      throw error;
    }
  }

  // 12. Moderate/delete a message
  async moderateMessage(chatId, messageId) {
    try {
      const response = await api.delete(`/api/chat/${chatId}/messages/${messageId}`);
      console.log('Message moderated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to moderate message:', error);
      throw error;
    }
  }

  // 13. Resolve an issue
  async resolveIssue(chatId, status = 'resolved') {
    try {
      const response = await this.updateChatStatus(chatId, status, 'Issue resolved');
      return response;
    } catch (error) {
      console.error('Failed to resolve issue:', error);
      throw error;
    }
  }

  // 14. Reject an issue
  async rejectIssue(chatId, status = 'rejected', reason = '') {
    try {
      const response = await this.updateChatStatus(chatId, status, reason);
      return response;
    } catch (error) {
      console.error('Failed to reject issue:', error);
      throw error;
    }
  }

  // 15. Get pending extensions for current user
  async getMyPendingExtensions() {
    try {
      const response = await this.getAssignedChats({
        status: 'pending_review',
        type: 'extension'
      });
      return response;
    } catch (error) {
      console.error('Failed to get pending extensions:', error);
      throw error;
    }
  }
}

export default new ChatService();