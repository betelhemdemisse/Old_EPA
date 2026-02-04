import api from "./api";

class SubPollutionCategoryService {
  // Get all sub-pollution categories
  async getAllSubPollutionCategories() {
    try {
      const res = await api.get("/api/sub-pollution-categories");
      return res.data;
    } catch (err) {
      console.error("Error fetching sub-pollution categories:", err);
      return null;
    }
  }

  // Get sub-pollution category by ID
  async getSubPollutionCategoryById(id) {
    try {
      const res = await api.get(`/api/sub-pollution-categories/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching sub-pollution category with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new sub-pollution category
  async createSubPollutionCategory(data) {
    try {
      const res = await api.post("/api/sub-pollution-categories", data);
      return res.data;
    } catch (err) {
      console.error("Error creating sub-pollution category:", err);
      return null;
    }
  }

  // Update a sub-pollution category
  async updateSubPollutionCategory(id, data) {
    try {
      const res = await api.put(`/api/sub-pollution-categories/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating sub-pollution category with ID ${id}:`, err);
      return null;
    }
  }

  // Delete a sub-pollution category
  async deleteSubPollutionCategory(id) {
    try {
      const res = await api.delete(`/api/sub-pollution-categories/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting sub-pollution category with ID ${id}:`, err);
      return null;
    }
  }
}

export default new SubPollutionCategoryService();
