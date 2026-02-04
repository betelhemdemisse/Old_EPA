import api from "./api";

class GeneralReportService {
  async getAllGeneralReport(params = {}) {
  try {
    const res = await api.get("/api/general-dashboard/", { params });
    return res.data;
  } catch (err) {
    console.error("Error fetching General Report:", err);
    return null;
  }
}


   async getAllGeneralDashboardReport() {
    try {
      const res = await api.get("/api/general-reports/dashboard-stats");
      return res.data;
    } catch (err) {
      console.error("Error fetching General DashBoar Report:", err);
      return null;
    }
  }

   async getAllCities() {
    try {
      const res = await api.get("/api/cities");
      console.log(res, "res from the city service");
      return res.data;
    } catch (err) {
      console.error("Error fetching cities:", err);
      return null;
    }
  } 
   async getAllRegions() {
    try {
      const res = await api.get("/api/regions");
      console.log(res, "res from the region service");
      return res.data;
    } catch (err) {
      console.error("Error fetching regions:", err);
      return null;
    }
  }
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





 


}

export default new GeneralReportService();
