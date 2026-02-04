import api from "./api";

class SoundAreaService {
  // Get all sound areas
  async getAllSoundAreas() {
    try {
      const res = await api.get("/api/sound-areas");
      return res.data.data; // ✅ return array only
    } catch (err) {
      console.error("Error fetching sound areas:", err);
      return [];
    }
  }

  // Get a sound area by ID
  async getSoundAreaById(id) {
    try {
      const res = await api.get(`/api/sound-areas/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching sound area with ID ${id}:`, err);
      return null;
    }
  }

  // Create a new sound area
  async createSoundArea(data) {
    try {
      const res = await api.post("/api/sound-areas", data);
      return res.data;
    } catch (err) {
      console.error("Error creating sound area:", err);
      return null;
    }
  }

  // Update a sound area
  async updateSoundArea(id, data) {
    try {
      const res = await api.put(`/api/sound-areas/${id}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating sound area with ID ${id}:`, err);
      return null;
    }
  }

  // Delete a sound area
  async deleteSoundArea(id) {
    try {
      const res = await api.delete(`/api/sound-areas/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting sound area with ID ${id}:`, err);
      return null;
    }
  }
}

export default new SoundAreaService();
