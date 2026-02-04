import api from "./api";

class FeedbackService {
  // Submit feedback for a case
  async submitFeedback(caseId, comment) {
    try {
      const res = await api.post("/api/feedback", { case_id: caseId, comment });
      return res.data;
    } catch (err) {
      console.error("Error submitting feedback:", err);
      return null;
    }
  }

  // Get all feedback for a specific case
  async getFeedbackByCase(case_id) {
    try {
      const res = await api.get(`/api/feedback/${case_id}/case`);
      return res.data;
    } catch (err) {
      console.error("Error fetching feedback:", err);
      return null;
    }
  }

  // Update a feedback entry
  async updateFeedback(feedbackId, comment) {
    try {
      const res = await api.put(`/api/feedback/${feedbackId}`, { comment });
      return res.data;
    } catch (err) {
      console.error(`Error updating feedback with ID ${feedbackId}:`, err);
      return null;
    }
  }
}

export default new FeedbackService();
