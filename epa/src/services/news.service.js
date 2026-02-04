import api from "./api";

class NewsService {
  // Get all news
  async getAllNews() {
    try {
      const res = await api.get("/api/news");
      return res.data.data; // return array only
    } catch (err) {
      console.error("Error fetching news:", err);
      return [];
    }
  }

  // Get news by ID
  async getNewsById(newsId) {
    try {
      const res = await api.get(`/api/news/${newsId}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching news with ID ${newsId}:`, err);
      return null;
    }
  }

  // Create news
  async createNews(data) {
    try {
      const res = await api.post("/api/news", data);
      return res.data;
    } catch (err) {
      console.error("Error creating news:", err);
      return null;
    }
  }

  // Update news
  async updateNews(newsId, data) {
    try {
      const res = await api.put(`/api/news/${newsId}`, data);
      return res.data;
    } catch (err) {
      console.error(`Error updating news with ID ${newsId}:`, err);
      return null;
    }
  }

  // Delete news
  async deleteNews(newsId) {
    try {
      const res = await api.delete(`/api/news/${newsId}`);
      return res.data;
    } catch (err) {
      console.error(`Error deleting news with ID ${newsId}:`, err);
      return null;
    }
  }
}

export default new NewsService();
