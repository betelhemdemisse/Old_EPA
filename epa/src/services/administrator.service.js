import api from "./api";

class AdministratorService {
  // Get all administrators
  async getAllAdministrators() {
    try {
      const res = await api.get("/api/administrator");
      return res.data;
    } catch (err) {
      console.error("Error fetching administrators:", err);
      return null;
    }
  }
  
   async getAllRegionUser() {
    try {
      const res = await api.get("/api/administrator/all_regional/user");
      return res.data;
    } catch (err) {
      console.error("Error fetching region administrators:", err);
      return null;
    }
  }

  // Get administrator by ID
  async getAdministratorById(id) {
    try {
      const res = await api.get(`/api/administrator/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching administrator with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new administrator
  async createAdministrator(data) {
    try {
      const res = await api.post("/api/administrator", data);
      return res.data;
    } catch (err) {
      console.error("Error creating administrator:", err);
      return null;
    }
  }

  // Update an administrator
  async updateAdministrator(id, data) {
    try {
      const res = await api.put(`/api/administrator/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating administrator with ID ${id}:`, err);
      return null;
    }
  }


  // Delete an administrator
  async deleteAdministrator(id) {
    try {
      const res = await api.delete(`/api/administrator/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting administrator with ID ${id}:`, err);
      return null;
    }
  }
}

export default new AdministratorService();
