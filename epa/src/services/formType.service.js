// services/formType.service.js
import api from "./api";

class FormTypeService {
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

  // Get a single FormType by ID
  async getFormTypeById(id) {
    try {
      const res = await api.get(`/api/form-type/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching FormType with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new FormType
  async createFormType(data) {
    try {
      const res = await api.post("/api/form-type", data);
      return res.data;
    } catch (err) {
      console.error("Error creating FormType:", err);
      return null;
    }
  }

  // Update a FormType by ID
  async updateFormType(id, data) {
    try {
      const res = await api.put(`/api/form-type/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating FormType with ID ${id}:`, err);
      return null;
    }
  }

  // Delete a FormType by ID
  async deleteFormType(id) {
    try {
      const res = await api.delete(`/api/form-type/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting FormType with ID ${id}:`, err);
      return null;
    }
  }
}

export default new FormTypeService();
