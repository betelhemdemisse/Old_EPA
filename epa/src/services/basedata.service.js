import api from "./api";

class CityService {
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

  async getCityById(id) {
    try {
      const res = await api.get(`/api/cities/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching city with ID ${id}:`, err);
      return null;
    }
  }

  async createCity(data) {
    try {
      const res = await api.post("/api/cities", data);
      return res.data;
    } catch (err) {
      console.error("Error creating city:", err);
      return null;
    }
  }

  async updateCity(id, data) {
    try {
      const res = await api.put(`/api/cities/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating city with ID ${id}:`, err);
      return null;
    }
  }

  async deleteCity(id) {
    try {
      const res = await api.delete(`/api/cities/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting city with ID ${id}:`, err);
      return null;
    }
  }
}

class RegionService {
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

  async getRegionById(id) {
    try {
      const res = await api.get(`/api/regions/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching region with ID ${id}:`, err);
      return null;
    }
  }

  async createRegion(data) {
    try {
      const res = await api.post("/api/regions", data);
      return res.data;
    } catch (err) {
      console.error("Error creating region:", err);
      return null;
    }
  }

  async updateRegion(id, data) {
    try {
      const res = await api.put(`/api/regions/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating region with ID ${id}:`, err);
      return null;
    }
  }

  async deleteRegion(id) {
    try {
      const res = await api.delete(`/api/regions/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting region with ID ${id}:`, err);
      return null;
    }
  }
}

class SubcityService {
  async getAllSubcities() {
    try {
      const res = await api.get("/api/subcities");
      console.log(res, "res from the subcity service");
      return res.data;
    } catch (err) {
      console.error("Error fetching subcities:", err);
      return null;
    }
  }

  async getSubcitiesByCity(id) {
    try {
      const res = await api.get(`/api/subcities/city/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching subcities by city ${id}:`, err);
      return null;
    }
  }

  async getSubcityById(id) {
    try {
      const res = await api.get(`/api/subcities/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching subcity with ID ${id}:`, err);
      return null;
    }
  }

  async createSubcity(data) {
    try {
      const res = await api.post("/api/subcities", data);
      return res.data;
    } catch (err) {
      console.error("Error creating subcity:", err);
      return null;
    }
  }

  async updateSubcity(id, data) {
    try {
      const res = await api.put(`/api/subcities/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating subcity with ID ${id}:`, err);
      return null;
    }
  }

  async deleteSubcity(id) {
    try {
      const res = await api.delete(`/api/subcities/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting subcity with ID ${id}:`, err);
      return null;
    }
  }
}

class ZoneService {
  async getAllZones() {
    try {
      const res = await api.get("/api/zones");
      console.log(res, "res from the zone service");
      return res.data;
    } catch (err) {
      console.error("Error fetching zones:", err);
      return null;
    }
  }

  async getZonesByRegion(id) {
    try {
      const res = await api.get(`/api/zones/region/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching zones by region ${id}:`, err);
      return null;
    }
  }

  async getZoneById(id) {
    try {
      const res = await api.get(`/api/zones/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching zone with ID ${id}:`, err);
      return null;
    }
  }

  async createZone(data) {
    try {
      const res = await api.post("/api/zones", data);
      return res.data;
    } catch (err) {
      console.error("Error creating zone:", err);
      return null;
    }
  }

  async updateZone(id, data) {
    try {
      const res = await api.put(`/api/zones/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating zone with ID ${id}:`, err);
      return null;
    }
  }

  async deleteZone(id) {
    try {
      const res = await api.delete(`/api/zones/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting zone with ID ${id}:`, err);
      return null;
    }
  }
}

class WoredaService {
  async getAllWoredas() {
    try {
      const res = await api.get("/api/woredas");
      console.log(res, "res from the woreda service");
      return res.data;
    } catch (err) {
      console.error("Error fetching woredas:", err);
      return null;
    }
  }

  async getWoredaById(id) {
    try {
      const res = await api.get(`/api/woredas/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching woreda with ID ${id}:`, err);
      return null;
    }
  }

  async createWoreda(data) {
    try {
      const res = await api.post("/api/woredas", data);
      return res.data;
    } catch (err) {
      console.error("Error creating woreda:", err);
      return null;
    }
  }

  async updateWoreda(id, data) {
    try {
      const res = await api.put(`/api/woredas/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating woreda with ID ${id}:`, err);
      return null;
    }
  }

  async deleteWoreda(id) {
    try {
      const res = await api.delete(`/api/woredas/${id}`);
      return res.status === 204;
    } catch (err) {
      console.error(`Error deleting woreda with ID ${id}:`, err);
      return false;
    }
  }
}

class HandlingUnitService {
  async getAllHandlingUnits() {
    try {
      const res = await api.get("/api/handling-units");
      console.log(res, "res from the handling unit service");
      return res.data;
    } catch (err) {
      console.error("Error fetching handling units:", err);
      return null;
    }
  }

  async getHandlingUnitById(id) {
    try {
      const res = await api.get(`/api/handling-units/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching handling unit with ID ${id}:`, err);
      return null;
    }
  }

  async createHandlingUnit(data) {
    try {
      const res = await api.post("/api/handling-units", data);
      return res.data;
    } catch (err) {
      console.error("Error creating handling unit:", err);
      return null;
    }
  }

  async updateHandlingUnit(id, data) {
    try {
      const res = await api.put(`/api/handling-units/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating handling unit with ID ${id}:`, err);
      return null;
    }
  }

  async deleteHandlingUnit(id) {
    try {
      const res = await api.delete(`/api/handling-units/${id}`);
      return res.status === 204;
    } catch (err) {
      console.error(`Error deleting handling unit with ID ${id}:`, err);
      return false;
    }
  }
}

export { CityService, RegionService, SubcityService, ZoneService, WoredaService, HandlingUnitService };
export default {
  CityService: new CityService(),
  RegionService: new RegionService(),
  SubcityService: new SubcityService(),
  ZoneService: new ZoneService(),
  WoredaService: new WoredaService(),
  HandlingUnitService: new HandlingUnitService()
};
