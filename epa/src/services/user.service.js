import api from "./api";

class UserService {


  async getAllUsers() {
    try {
      const res = await api.get("api/administrator");

      console.log(res , "res from the service")
      return res.data;
    } catch (err) {
      console.error("Error fetching sub-pollution categories:", err);
      return null;
    }
  }
    async getAllExperts() {
    try {
      const res = await api.get("/api/administrator/get_all/user/experts");
      return res.data;
    } catch (err) {
      console.error("Error fetching administrators:", err);
      return null;
    }
  }
   async getOrganizationHierarchy() {
    try {
      const res = await api.get("/api/organization-hierarchy");

      console.log(res.data.data , "res from the service")
      return res.data;
    } catch (err) {
      console.error("Error fetching sub-pollution categories:", err);
      return null;
    }
  }
async activeUser(id) {
    try {
      const res = await api.patch(`/api/administrator/${id}/activate`);
      return res.data;
    } catch (err) {
      console.error(`Error activating administrator with ID ${id}:`, err);
      return null;
    }
  }

  // Deactivate administrator
  async deactiveUser(id) {
    try {
      const res = await api.patch(`/api/administrator/${id}/deactivate`);
      return res.data;
    } catch (err) {
      console.error(`Error deactivating administrator with ID ${id}:`, err);
      return null;
    }
  }
  async getUsersById(id) {
    try {
      const res = await api.get(`api/administrator/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching sub-pollution category with ID ${id}:`, err);
      return null;
    }
  }

  async createUsers(data) {
    try {
      const res = await api.post("api/administrator", data);
      return res.data;
    } catch (err) {
      console.error("Error creating sub-pollution category:", err);
      return null;
    }
  }

  async updateUsers(id, data) {
    try {
      const res = await api.put(`api/administrator/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating sub-pollution category with ID ${id}:`, err);
      return null;
    }
  }

  async deleteUsers(id) {
    try {
      const res = await api.delete(`api/administrator/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting sub-pollution category with ID ${id}:`, err);
      return null;
    }
  }
}

export default new UserService();
