import api from "./api";

class EPAOfficeLocationsService {
  // Get all EPA office locations
  async getAllEPAOfficeLocations() {
    try {
      const res = await api.get("/api/epa-office-locations");
      return res.data.data; // return array only
    } catch (err) {
      console.error("Error fetching EPA office locations:", err);
      return [];
    }
  }

  // Get a single office location by ID
  async getEPAOfficeLocationById(id) {
    try {
      const res = await api.get(`/api/epa-office-locations/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching EPA office location with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new EPA office location
  async createEPAOfficeLocation(data) {
    try {
      const res = await api.post("/api/epa-office-locations", data);
      return res.data;
    } catch (err) {
      console.error("Error creating EPA office location:", err);
      return null;
    }
  }

  // Update an EPA office location
  async updateEPAOfficeLocation(id, data) {
    try {
      const res = await api.put(`/api/epa-office-locations/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating EPA office location with ID ${id}:`, err);
      return null;
    }
  }

  // Delete an EPA office location
  async deleteEPAOfficeLocation(id) {
    try {
      const res = await api.delete(`/api/epa-office-locations/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting EPA office location with ID ${id}:`, err);
      return null;
    }
  }
}

export default new EPAOfficeLocationsService();
