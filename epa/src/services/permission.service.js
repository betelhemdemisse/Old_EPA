import api from "./api";

class PermissionService {
  // Get all permissions
  async getAllPermissions() {
    try {
      const res = await api.get("/api/permissions");
      return res.data;
    } catch (err) {
      console.error("Error fetching permissions:", err);
      return null;
    }
  }

  // Get permission by ID
  async getPermissionById(id) {
    try {
      const res = await api.get(`/api/permissions/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching permission with ID ${id}:`, err);
      return null;
    }
  }

  // Create permission
  async createPermission(data) {
    try {
      const res = await api.post("/api/permissions", data);
      return res.data;
    } catch (err) {
      console.error("Error creating permission:", err);
      return null;
    }
  }

  // Update permission
  async updatePermission(id, data) {
    try {
      const res = await api.put(`/api/permissions/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating permission with ID ${id}:`, err);
      return null;
    }
  }

  // Delete permission
  async deletePermission(id) {
    try {
      const res = await api.delete(`/api/permissions/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting permission with ID ${id}:`, err);
      return null;
    }
  }
}

export default new PermissionService();
