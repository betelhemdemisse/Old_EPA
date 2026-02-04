import api from "./api";

class RoleService {
  // Get all roles
  async getAllRoles() {
    try {
      const res = await api.get("/api/roles");
      return res.data;
    } catch (err) {
      console.error("Error fetching roles:", err);
      return null;
    }
  }

  // Get role by ID
  async getRoleById(id) {
    try {
      const res = await api.get(`/api/roles/${id}`);
      console.log("logogogog", res);
      
      return res.data;
    } catch (err) {
      console.error(`Error fetching role with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new role
  async createRole(data) {
    try {
      const res = await api.post("/api/roles", data);
      return res.data;
    } catch (err) {
      console.error("Error creating role:", err);
      return null;
    }
  }

  // Update a role
  async updateRole(id, data) {
    try {
      const res = await api.put(`/api/roles/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating role with ID ${id}:`, err);
      return null;
    }
  }

  // Delete a role
  async deleteRole(id) {
    try {
      const res = await api.delete(`/api/roles/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting role with ID ${id}:`, err);
      return null;
    }
  }

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
}

export default new RoleService();
