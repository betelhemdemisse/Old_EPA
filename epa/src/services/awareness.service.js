import api from "./api";

class AwarenessService {
  // Get all awareness items
  async getAllAwareness() {
    try {
      const res = await api.get("/api/awareness");
      return res.data.data; // return array only
    } catch (err) {
      console.error("Error fetching awareness items:", err);
      return [];
    }
  }

  // Get awareness by ID
  async getAwarenessById(id) {
    try {
      const res = await api.get(`/api/awareness/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching awareness with ID ${id}:`, err);
      return null;
    }
  }

  // Create awareness content
  async createAwareness(data) {
    try {
      const res = await api.post("/api/awareness", data);
      return res.data;
    } catch (err) {
      console.error("Error creating awareness content:", err);
      return null;
    }
  }

  // Update awareness content
  async updateAwareness(id, data) {
    try {
      const res = await api.put(`/api/awareness/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating awareness with ID ${id}:`, err);
      return null;
    }
  }

  // Delete awareness content
  async deleteAwareness(id) {
    try {
      const res = await api.delete(`/api/awareness/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting awareness with ID ${id}:`, err);
      return null;
    }
  }
}

export default new AwarenessService();
