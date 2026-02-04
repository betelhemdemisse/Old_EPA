import api from "./api";

class RegionalWorkflowService {
  
  //  REGION ADMIN
     
  async getComplaintForRegionAdmin() {
    try {
      const res = await api.get("/api/regional-workflow/region/complaint/pull");
      return res.data;
    } catch (err) {
      console.error("Error pulling complaint for Region Admin:", err);
      throw err.response?.data || err;
    }
  }

  async assignFromRegion(data) {
    // data: { complaint_id, organization_hierarchy_id, assign_to: "expert"|"zone", expert_id? }
    try {
      console.log("datadata", data);
      const res = await api.post("/api/regional-workflow/region/assign", data);
      return res.data;
    } catch (err) {
      console.error("Error assigning from Region:", err);
      throw err.response?.data || err;
    }
  }

  /**
   * NEW: Create a regional investigation team
   * Used when Region Admin selects multiple experts and forms a team
   * 
   * @param {Object} data
   * @param {string} data.case_id - UUID of the existing case
   * @param {Array<string>} data.users - Array of user_id (experts to add to team)
   * @param {string} [data.handling_unit="regional_team"] - Fixed for regional teams
   * 
   * @returns {Promise<Object>}
   */
  async createRegionalTeam(data) {
    try {
      const res = await api.post("/api/regional-team-case/create", data);
      return res.data;
    } catch (err) {
      console.error("Error creating regional team:", err);
      throw err.response?.data || err;
    }
  }

  
  //  ZONE ADMIN
     
  async getComplaintForZoneAdmin() {
    try {
      const res = await api.get("/api/regional-workflow/zone/complaint/pull");
      return res.data;
    } catch (err) {
      console.error("Error pulling complaint for Zone Admin:", err);
      throw err.response?.data || err;
    }
  }

  async assignFromZone(data) {
    try {
      const res = await api.post("/api/regional-workflow/zone/assign", data);
      return res.data;
    } catch (err) {
      console.error("Error assigning from Zone:", err);
      throw err.response?.data || err;
    }
  }

  
  //  WOREDA ADMIN
    
  async getComplaintForWoredaAdmin() {
    try {
      const res = await api.get("/api/regional-workflow/woreda/complaint/pull");
      return res.data;
    } catch (err) {
      console.error("Error pulling complaint for Woreda Admin:", err);
      throw err.response?.data || err;
    }
  }

  async assignToWoredaExpert(data) {
    try {
      const res = await api.post("/api/regional-workflow/woreda/assign-expert", data);
      return res.data;
    } catch (err) {
      console.error("Error assigning to Woreda Expert:", err);
      throw err.response?.data || err;
    }
  }

  
  //  REGIONAL EXPERT
    
  async getNextCaseForExpert() {
    try {
      const res = await api.get("/api/regional-workflow/expert/case");
      return res.data;
    } catch (err) {
      console.error("Error getting next case for regional expert:", err);
      throw err.response?.data || err;
    }
  }

  async getAllAssignedCasesForExpert() {
    try {
      const res = await api.get("/api/regional-workflow/expert/cases");
      return res.data;
    } catch (err) {
      console.error("Error fetching assigned cases:", err);
      throw err.response?.data || err;
    }
  }

  async countUnopenedRegionalCases() {
    try {
      const res = await api.get("/api/regional-workflow/expert/cases/unopened/count");
      return res.data;
    } catch (err) {
      console.error("Error fetching unopened count:", err);
      throw err.response?.data || err;
    }
  }

  async openRegionalCase() {
    try {
      console.log("Opening regional case - service");
      const res = await api.get("/api/regional-workflow/expert/case/open");
      return res.data;
    } catch (err) {
      console.error("Error opening regional case:", err);
      throw err.response?.data || err;
    }
  }

  async submitInvestigation(case_id, formData) {
    try {
      const res = await api.post(
        `/api/regional-workflow/expert/${case_id}/submit-investigation`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Error submitting investigation:", err);
      throw err.response?.data || err;
    }
  }

  async deleteAttachment(attachmentId) {
    try {
      const res = await api.delete(`/api/regional-workflow/case_attachment/${attachmentId}`);
      return res.data;
    } catch (err) {
      console.error("Error deleting attachment:", err);
      throw err.response?.data || err;
    }
  }

  
  //  REGION ADMIN REVIEW
     
  async reviewInvestigation(data) {
    try {
      const res = await api.post("/api/regional-workflow/region/investigation/review", data);
      return res.data;
    } catch (err) {
      console.error("Error reviewing investigation:", err);
      throw err.response?.data || err;
    }
  }
}

export default new RegionalWorkflowService();