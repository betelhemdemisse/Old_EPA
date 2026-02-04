// services/reportingForm.service.js
import api from "./api";

class ReportingFormService {
  // Get all ReportingForms (optional filters)
  async getAllReportingForms(filters = {}) {
    try {
      // Build query string from filters if provided
      const query = new URLSearchParams(filters).toString();
      const url = query ? `/api/reporting-form?${query}` : "/api/reporting-form";

      const res = await api.get(url);
      return res.data;
    } catch (err) {
      console.error("Error fetching ReportingForms:", err);
      return null;
    }
  }

  // Get a single ReportingForm by ID
  async getReportingFormById(id) {
    try {
      const res = await api.get(`/api/reporting-form/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching ReportingForm with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new ReportingForm
  async createReportingForm(data) {
    try {
      const res = await api.post("/api/reporting-form", data);
      return res.data;
    } catch (err) {
      console.error("Error creating ReportingForm:", err);
      return null;
    }
  }

  // Update a ReportingForm by ID
async updateReportingForm(id, data) {
  try {
    console.log("updateReportingForm called with id:", id);  // 👈 ADD HERE
    console.log("payload:", data);                           // 👈 ADD HERE

    const res = await api.put(`/api/reporting-form/${id}`, data);
    return res.data;
  } catch (err) {
    console.error(`Error updating ReportingForm with ID ${id}:`, err);
    return null;
  }
}


  // Delete a ReportingForm by ID
  async deleteReportingForm(id) {
    try {
      const res = await api.delete(`/api/reporting-form/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting ReportingForm with ID ${id}:`, err);
      return null;
    }
  }

  // Get all FormTypes
  async getAllFormTypes() {
    try {
      const res = await api.get("/api/form-type");
      return res.data;
    } catch (err) {
      console.error("Error fetching FormTypes:", err);
      return null;
    }
  }

   async getAllReportTypes() {
    try {
      const res = await api.get("/api/report-type");
      return res.data;
    } catch (err) {
      console.error("Error fetching ReportTypes:", err);
      return null;
    }
  }
}

export default new ReportingFormService();
