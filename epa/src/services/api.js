import axios from "axios";

const api = axios.create({
// baseURL: "http://192.168.220.127:5000/",
  // baseURL: "http://196.188.240.103:4032/",
baseURL: "http://localhost:5000/",
  timeout: 20000,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // Attach token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request:", config.url, "Headers:", config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response || error);
    return Promise.reject(error);
  }
);

export default api;
