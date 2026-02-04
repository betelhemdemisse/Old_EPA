import api from "./api";

class RejectionReasonService {
  // Get all rejection reasons
  async getAllRejectionReasons() {
    try {
      const res = await api.get("/api/rejection-reasons");
      return res.data.data;
    } catch (err) {
      console.error("Error fetching rejection reasons:", err);
      return [];
    }
  }

  // Get a single rejection reason by ID
  async getRejectionReasonById(id) {
    try {
      const res = await api.get(`/api/rejection-reasons/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching rejection reason with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new rejection reason
  async createRejectionReason(data) {
    try {
      const res = await api.post("/api/rejection-reasons", data);
      return res.data;
    } catch (err) {
      console.error("Error creating rejection reason:", err);
      return null;
    }
  }

  // Update a rejection reason
  async updateRejectionReason(id, data) {
    try {
      const res = await api.put(`/api/rejection-reasons/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating rejection reason with ID ${id}:`, err);
      return null;
    }
  }

  // Delete a rejection reason
  async deleteRejectionReason(id) {
    try {
      const res = await api.delete(`/api/rejection-reasons/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting rejection reason with ID ${id}:`, err);
      return null;
    }
  }
}

export default new RejectionReasonService();
