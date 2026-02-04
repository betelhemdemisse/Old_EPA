import api from "./api";

class PollutionCategoryService {
  async getAllPollutionCategories() {
    try {
      const res = await api.get("/api/pollution-categories");
      console.log(res, "res from the pollution category service");
      return res.data;
    } catch (err) {
      console.error("Error fetching pollution categories:", err);
      return null;
    }
  }

  async getPollutionCategoryById(id) {
    try {
      const res = await api.get(`/api/pollution-categories/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching pollution category with ID ${id}:`, err);
      return null;
    }
  }

  async createPollutionCategory(data) {
    try {
      const res = await api.post("/api/pollution-categories", data);
      return res.data;
    } catch (err) {
      console.error("Error creating pollution category:", err);
      return null;
    }
  }

  async updatePollutionCategory(id, data) {
    try {
      const res = await api.put(`/api/pollution-categories/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating pollution category with ID ${id}:`, err);
      return null;
    }
  }

  async deletePollutionCategory(id) {
    try {
      const res = await api.delete(`/api/pollution-categories/${id}`);
      return res.status === 204 || res.status === 200;
    } catch (err) {
      console.error(`Error deleting pollution category with ID ${id}:`, err);
      return false;
    }
  }
}

class SubPollutionCategoryService {
  async getAllSubPollutionCategories() {
    try {
      const res = await api.get("/api/sub-pollution-categories");
      console.log(res, "res from the sub-pollution category service");
      return res.data;
    } catch (err) {
      console.error("Error fetching sub-pollution categories:", err);
      return null;
    }
  }

  async getSubPollutionCategoriesByPollutionCategoryId(pollutionCategoryId) {
    try {
      console.log(pollutionCategoryId, "pollutionCategoryId");
      const res = await api.get(`/api/sub-pollution-categories?pollution_category_id=${pollutionCategoryId}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching sub-pollution categories for pollution category ID ${pollutionCategoryId}:`, err);
      return null;
    }
  }

  async getSubPollutionCategoryById(id) {
    try {
      const res = await api.get(`/api/sub-pollution-categories/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching sub-pollution category with ID ${id}:`, err);
      return null;
    }
  }

  async createSubPollutionCategory(data) {
    try {
      const res = await api.post("/api/sub-pollution-categories", data);
      return res.data;
    } catch (err) {
      console.error("Error creating sub-pollution category:", err);
      return null;
    }
  }

  async updateSubPollutionCategory(id, data) {
    try {
      const res = await api.put(`/api/sub-pollution-categories/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating sub-pollution category with ID ${id}:`, err);
      return null;
    }
  }

  async deleteSubPollutionCategory(id) {
    try {
      const res = await api.delete(`/api/sub-pollution-categories/${id}`);
      return res.status === 204 || res.status === 200;
    } catch (err) {
      console.error(`Error deleting sub-pollution category with ID ${id}:`, err);
      return false;
    }
  }
}

// Export classes
export { PollutionCategoryService, SubPollutionCategoryService };

// Export as default object with instances
export default {
  PollutionCategoryService: new PollutionCategoryService(),
  SubPollutionCategoryService: new SubPollutionCategoryService()
};  