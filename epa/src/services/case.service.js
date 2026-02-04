import api from "./api";
class CaseService {
 async getComplaintForExpert() {
  try {
    const res = await api.get("/api/case/expert");
    return res.data;
  } catch (err) {
    console.error("Error fetching pending complaint for taskforce:", err);
    return null;
  }
}
async getReportType(){
  try{
    const res = await api.get("/api/report-type");
    return res.data;
  }
  catch(err){
 console.error("Error fetching report type:", err);
    return null;
  }
}
async getDynamicForm(report_type_id){
  try{
    console.log("report_type_idreport_type_idreport_type_id",report_type_id)
    const res = await api.get(`/api/report-submit/form/${report_type_id}`);
    return res.data;
  }
  catch(err){
  console.error("Error fetching dynamic form:", err);
    return null;
  }
}

async submitDynamicForm(formData){
  try{
    const res = await api.post('/api/report-submit',formData);
    return res;
  } catch(err){
    console.error("Error submitting dynamic form:", err);
    return null;
  }
}
  async getAssignedComplaintDetail(complaint_id) {
    console.log("complaint_id in service",complaint_id)
    try {
      const res = await api.get(`/api/case/${complaint_id}`);
      console.log("reportssss " , res)
      return res.data;
    } catch (err) {
      console.error("Error fetching complaints:", err);
      return null;
    }
  }

  async createTeam(payloadOrComplaintId, handlingUnit, is_Team_Formation_needed, userIds, formed_by = null) {
    try {
      let payload;

      // Support calling createTeam with a single payload object (new callers)
      if (payloadOrComplaintId && typeof payloadOrComplaintId === 'object' && payloadOrComplaintId.complaint_id) {
        payload = payloadOrComplaintId;
      } else {
        // Backwards compatible signature
        const complaint_id = payloadOrComplaintId;
        const users = Array.isArray(userIds)
          ? userIds
          : (userIds || []);

        payload = {
          complaint_id,
          users,
          formed_by: formed_by || undefined,
          handling_unit: handlingUnit,
          is_Team_Formation_needed: is_Team_Formation_needed,
        };
      }

      const response = await api.post("/api/teams-cases/create", payload);

      return {
        success: true,
        data: response.data,
        message: response.data.message || "Team created successfully",
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create team";

      console.error("createTeam error:", err.response?.data || err);

      return {
        success: false,
        error: errorMessage,
        status: err.response?.status,
      };
    }
  }
  
 async countCaseForExpert() {
    try {
      const res = await api.get("/api/case/count/pending");
      return res.data;
    } catch (err) {
      console.error("Error fetching complaints:", err);
      return null;
    }
  }
  async returnCase(case_id, data) {
    try{
      const res = await api.patch(`/api/case/${case_id}/return_case`, data);
    return res.data;
    } catch (err) {
      console.error(`Error rejecting case`, err);
      return null;
    }
  }
  async getHQExperts() {
    try {
      const res = await api.get("/api/case/get/headquarter/experts");
      return res.data;
    } catch (err) {
      console.error("Error fetching experts", err);
      return null;
    }
  }
  async forceExpertAssign(payload) {
    try {
     const res = await api.post("/api/case/force/assign-expert", payload);
    return res.data;
    } catch (err) {
      console.error("Error assigning expert:", err);
      return null;
    }
  }

 async getExpertAssignedComplaints() {
    try {
      const res = await api.get("/api/case/expert_assigned_case");
      console.log("reports " , res)
      return res.data;
    } catch (err) {
      console.error("Error fetching complaints:", err);
      return null;
    }
  }
  async deleteAttachment(attachmentId) {
    try {
      const res = await api.delete(`/api/case/case_attachment/${attachmentId}`);
      return res.data;
    }
    catch (err) {
      console.error("Error deleting attachment:", err);
      return null;
    }
  }
 async submitExpertReport(case_id, reportData) {
    try {
      const formData = new FormData();

      reportData.files.forEach((file) => formData.append("files", file));

      formData.append("description", reportData.description);
      formData.append("isFinal", reportData.isFinal);

      const res = await api.post(
        `/api/case/expert/${case_id}/submit-investigation`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return res.data;
    } catch (err) {
      console.error("Error submitting report:", err);
      return null;
    }
  }
    
}
export default new CaseService();

