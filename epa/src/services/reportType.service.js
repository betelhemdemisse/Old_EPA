// services/reportType.service.js
import api from "./api";

class ReportTypeService {
  // Get all ReportTypes
  async getAllReportTypes() {
    try {
      const res = await api.get("/api/report-type");
      return res.data;
    } catch (err) {
      console.error("Error fetching ReportTypes:", err);
      return null;
    }
  }

  // Get a single ReportType by ID
  async getReportTypeById(id) {
    try {
      const res = await api.get(`/api/report-type/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching ReportType with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new ReportType
  async createReportType(data) {
    try {
      const res = await api.post("/api/report-type", data);
      return res.data;
    } catch (err) {
      console.error("Error creating ReportType:", err);
      return null;
    }
  }

  // Update a ReportType by ID
  async updateReportType(id, data) {
    try {
      const res = await api.put(`/api/report-type/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating ReportType with ID ${id}:`, err);
      return null;
    }
  }

  // Delete a ReportType by ID
  async deleteReportType(id) {
    try {
      const res = await api.delete(`/api/report-type/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting ReportType with ID ${id}:`, err);
      return null;
    }
  }
}

export default new ReportTypeService();
