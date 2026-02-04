import api from "./api";

class OrganizationHierarchyService {
  // Get all hierarchy levels
  async getAllHierarchies() {
    try {
      const res = await api.get("/api/organization-hierarchy");
      return res.data.data;
    } catch (err) {
      console.error("Error fetching organization hierarchies:", err);
      return [];
    }
  }

  // Get a single hierarchy by ID
  async getHierarchyById(id) {
    try {
      console.log("idddd",id);
      const res = await api.get(`/api/organization-hierarchy/${id}`);
      console.log("resss",res)
      return res.data;
    } catch (err) {
      console.error(`Error fetching hierarchy with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new hierarchy level
  async createHierarchy(data) {
    try {
      const res = await api.post("/api/organization-hierarchy", data);
      return res.data;
    } catch (err) {
      console.error("Error creating organization hierarchy:", err);
      return null;
    }
  }

  // Update a hierarchy level
  async updateHierarchy(id, data) {
    try {
      const res = await api.put(`/api/organization-hierarchy/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating hierarchy with ID ${id}:`, err);
      return null;
    }
  }

  // Delete a hierarchy level
  async deleteHierarchy(id) {
    try {
      const res = await api.delete(`/api/organization-hierarchy/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting hierarchy with ID ${id}:`, err);
      return null;
    }
  }
}

export default new OrganizationHierarchyService();
