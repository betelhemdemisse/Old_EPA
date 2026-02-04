import api from "./api";

class ComplaintService {
  // Get all complaints
  async getAllComplaints(status) {
    try {
      const res = await api.get("/api/complaints",{
        params:status
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching complaints:", err);
      return null;
    }
  }

  // Get complaint by ID
  async getComplaintById(id) {
    try {
      const res = await api.get(`/api/complaints/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching complaint with ID ${id}:`, err);
      return null;
    }
  }

  // Create complaint
  async createComplaint(data) {
    try {
      const res = await api.post("/api/complaints", data);
      return res.data;
    } catch (err) {
      console.error("Error creating complaint:", err);
      return null;
    }
  }

  // Update complaint
async updateComplaint(complaint_id, data) {
  try {
    console.log("dataaa",data)
    const res = await api.patch(`/api/complaint-workflow/${complaint_id}/update`, data);
    return res.data;
  } catch (err) {
    console.error(`Error updating complaint with ID ${complaint_id}:`, err);
    return null;
  }
}

async chooseHandlingUnit(complaint_id, data) {
  try{
    console.log("apiiiii",data)
    const res = await api.put(`/api/complaint-workflow/${complaint_id}`, data);
    console.log("resss",res)
    console.log("resss",res.data)
    return res.data;

  }catch (err) {
    console.error(`Error updating complaint with ID ${complaint_id}:`, err);
    return res.data;
  }
}
  // Delete complaint
  async deleteComplaint(id) {
    try {
      const res = await api.delete(`/api/complaints/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting complaint with ID ${id}:`, err);
      return null;
    }
  }

  // Verify complaint
  async verifyComplaint(id, data = {}) {
    try {
      const res = await api.patch(`/api/complaint-workflow/${id}/verify`, data);
      return res.data;
    } catch (err) {
      console.error(`Error verifying complaint ID ${id}:`, err);
      return null;
    }
  }

  // Accept team formation suggestion
  async acceptTeamSuggestion(id, data = {}) {
    try {
      const res = await api.patch(`/api/complaint-workflow/${id}/suggestion/accept`, data);
      return res.data;
    } catch (err) {
      console.error(`Error accepting team formation suggestion for ID ${id}:`, err);
      return null;
    }
  }

  // Update complaint details before verification
  async updateBeforeVerification(id, data) {
    try {
      const res = await api.patch(`/api/complaint-workflow/${id}/update`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating complaint before verification for ID ${id}:`, err);
      return null;
    }
  }

  // Get pending complaint for taskforce expert
  async getComplaintForTaskforce() {
  try {
    const res = await api.get("/api/complaint-workflow/complaint_for_taskforce");
    return res.data;
  } catch (err) {
    console.error("Error fetching pending complaint for taskforce:", err);
    return null;
  }
}

  // Get all complaints assigned to authenticated taskforce expert
  async getAssignedComplaints() {
    try {
      const res = await api.get("/api/complaint-workflow/assigned_complaints");
      return res.data;
    } catch (err) {
      console.error("Error fetching assigned complaints:", err);
      return null;
    }
  }

 async getPendingComplaintsCount() {
  try {
    const response = await api.get('/api/complaint-workflow/taskforce/pending-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending count:', error);
    throw error;
  }
}

  // Get all reports for deputy director
  async getAllReportsForDuptyDirector(Status) {
    try {
      const res = await api.get("/api/complaint-workflow/complaint/dupty_director",
       { params:{status:Status}}

      );
      console.log("reports " , res)
      return res.data;
    } catch (err) {
      console.error("Error fetching complaints:", err);
      return null;
    }
  }
}

export default new ComplaintService();
