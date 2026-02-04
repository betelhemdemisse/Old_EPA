import api from "./api";
class CustomerService {
 async getAllCustomers() {
    try {
      const res = await api.get("/api/customer-accounts");
      return res.data;
    } catch (err) {
      console.error("Error fetching customers:", err);
      return null;
    }
  }

  async activeCustomer(id) {
    try {
      const res = await api.patch(`/api/customer-accounts/${id}/activate`);
      return res.data;
    } catch (err) {
      console.error(`Error activating customer with ID ${id}:`, err);
      return null;
    }
  }

  // Deactivate administrator
  async deactiveCustomer(id) {
    try {
      const res = await api.patch(`/api/customer-accounts/${id}/deactivate`);
      return res.data;
    } catch (err) {
      console.error(`Error deactivating customer with ID ${id}:`, err);
      return null;
    }
  }
}
export default new CustomerService();
