import api from "./api";

class RegionService {
  // Get all regions
  async getAllRegions() {
    try {
      const res = await api.get("/api/regions");
      return res.data;
    } catch (err) {
      console.error("Error fetching regions:", err);
      return null;
    }
  }

  // Get region by ID
  async getRegionById(id) {
    try {
      const res = await api.get(`/api/regions/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching region with ID ${id}:`, err);
      return null;
    }
  }

  // Create region
  async createRegion(data) {
    try {
      const res = await api.post("/api/regions", data);
      return res.data;
    } catch (err) {
      console.error("Error creating region:", err);
      return null;
    }
  }

  // Update region
  async updateRegion(id, data) {
    try {
      const res = await api.put(`/api/regions/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating region with ID ${id}:`, err);
      return null;
    }
  }

  // Delete region
  async deleteRegion(id) {
    try {
      const res = await api.delete(`/api/regions/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting region with ID ${id}:`, err);
      return null;
    }
  }
}

export default new RegionService();
