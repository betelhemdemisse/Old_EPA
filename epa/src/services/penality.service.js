// src/services/Penalty.service.js

import api from "./api";

/* ========================
   PENALTY CATEGORY SERVICE
   ======================== */
class PenaltyCategoryService {
  // GET all penalty categories
  async getAllPenaltyCategories() {
    try {
      const res = await api.get("/api/penalties");
      console.log(res, "res from penalty category service");
      return res.data;
    } catch (err) {
      console.error("Error fetching penalty categories:", err);
      return null;
    }
  }

  // GET one by ID
  async getPenaltyCategoryById(id) {
    try {
      const res = await api.get(`/api/penalties/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching penalty category with ID ${id}:`, err);
      return null;
    }
  }

  // CREATE
  async createPenaltyCategory(data) {
    try {
      const res = await api.post("/api/penalties", data);
      return res.data;
    } catch (err) {
      console.error("Error creating penalty category:", err);
      return null;
    }
  }

  // UPDATE
  async updatePenaltyCategory(id, data) {
    try {
      const res = await api.put(`/api/penalties/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating penalty category with ID ${id}:`, err);
      return null;
    }
  }

  // DELETE
  async deletePenaltyCategory(id) {
    try {
      const res = await api.delete(`/api/penalties/${id}`);
      return res.status === 204 || res.status === 200;
    } catch (err) {
      console.error(`Error deleting penalty category with ID ${id}:`, err);
      return false;
    }
  }
}

/* ==============================
   PENALTY SUB-CATEGORY SERVICE
   ============================== */
class PenaltySubCategoryService {
  // GET all sub-categories
  async getAllPenaltySubCategories() {
    try {
      const res = await api.get("/api/penality-sub-category");
      console.log(res, "res from penalty sub-category service");
      return res.data;
    } catch (err) {
      console.error("Error fetching penalty sub-categories:", err);
      return null;
    }
  }

  // GET sub-categories by parent penalty ID
  async getPenaltySubCategoriesByPenaltyId(penaltyId) {
    try {
      const res = await api.get(`/api/penality-sub-category?penalty_id=${penaltyId}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching sub-categories for penalty ID ${penaltyId}:`, err);
      return null;
    }
  }

  // GET one sub-category by ID
  async getPenaltySubCategoryById(id) {
    try {
      const res = await api.get(`/api/penality-sub-category/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching penalty sub-category with ID ${id}:`, err);
      return null;
    }
  }

  // CREATE sub-category
  async createPenaltySubCategory(data) {
    try {
      const res = await api.post("/api/penality-sub-category", data);
      return res.data;
    } catch (err) {
      console.error("Error creating penalty sub-category:", err);
      return null;
    }
  }

  // UPDATE sub-category
  async updatePenaltySubCategory(id, data) {
    try {
      const res = await api.put(`/api/penality-sub-category/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating penalty sub-category with ID ${id}:`, err);
      return null;
    }
  }

  // DELETE sub-category
  async deletePenaltySubCategory(id) {
    try {
      const res = await api.delete(`/api/penality-sub-category/${id}`);
      return res.status === 204 || res.status === 200;
    } catch (err) {
      console.error(`Error deleting penalty sub-category with ID ${id}:`, err);
      return false;
    }
  }
}

// Export individual classes (for type safety / tree-shaking)
export { PenaltyCategoryService, PenaltySubCategoryService };

// Default export with instantiated services (same pattern as your other services)
export default {
  PenaltyCategoryService: new PenaltyCategoryService(),
  PenaltySubCategoryService: new PenaltySubCategoryService(),
};