import api from "./api";

class ReportService {
  // Get all complaints
  async getLoggedinUserAssignedReports() {
    try {
      const res = await api.get("/api/complaint-workflow/assigned_complaints");
      console.log("reports " , res)
      return res.data;
    } catch (err) {
      console.error("Error fetching complaints:", err);
      return null;
    }
  }
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
  async getAssignedReportDetail(complaintId) {
    try {
      const res = await api.get(`/api/complaint-workflow/${complaintId}`);
      console.log("reports " , res)
      return res.data;
    } catch (err) {
      console.error("Error fetching complaints:", err);
      return null;
    }
  }
  async authorizeComplaint(complaintId) {
    try {
      const res = await api.patch(`/api/complaint-workflow/${complaintId}/authorize`);
      console.log("reports " , res)
      return res.data;
    } catch (err) {
      console.error("Error fetching complaints:", err);
      return null;
    }
  }
async GetExpertForm(caseId) {
  console.log(caseId, "caseId from server");

  try {
    const res = await api.get(`/api/report-submit/submissions/result/${caseId}`, {
    });

    console.log("reports", res);
    return res.data;
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return null;
  }
}

async closeComplaint(complaintId, formData) {
  try {
    const res = await api.patch(
      `/api/complaint-workflow/${complaintId}/close`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Error closing complaint:", err);
    throw err;
  }
}


    async returnComplaint(complaintId, returnReason) {
    try {
      const res = await api.patch(`/api/complaint-workflow/${complaintId}/return`, { return_reason:returnReason });
      console.log("reports " , res)
      return res.data;
    } catch (err) {
      console.error("Error returning complaint:", err);
      return null;
    }
  }

  async rejectComplaint(complaintId, payload) {
    try {
      const res = await api.patch(`/api/complaint-workflow/${complaintId}/reject`,  payload );
      console.log("reports " , res)
      return res.data;
    } catch (err) {
      console.error("Error returning complaint:", err);
      return null;
    }
  }
  async getExpertsByHierarchyId(){
    try{
   const res = await api.get("/api/complaint-workflow/expert/by_hierarchy_id/by_loggedIn_user");
      return res.data;
    }
    catch{
       console.error("Error fetching experts:", err);
    return null;
    }
  }
   async getExpertsByZoneHierarchyId(){
    try{
   const res = await api.get("/api/complaint-workflow/expert/by_hierarchy_id/by_loggedIn_zone_user");
      return res.data;
    }
    catch{
       console.error("Error fetching experts:", err);
    return null;
    }
  }
     async getExpertsByWoredaHierarchyId(){
    try{
   const res = await api.get("/api/complaint-workflow/expert/by_hierarchy_id/by_loggedIn_woreda_user");
      return res.data;
    }
    catch{
       console.error("Error fetching experts:", err);
    return null;
    }
  }
  

}

export default new ReportService();
