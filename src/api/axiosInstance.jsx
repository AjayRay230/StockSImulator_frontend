import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://stocksimulator-backend.onrender.com",
});
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// RESPONSE INTERCEPTOR (GLOBAL)
axiosInstance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");

      window.location.href = "/login?reason=expired";
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
