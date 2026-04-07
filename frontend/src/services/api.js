import axios from "axios";

import { TOKEN_KEY } from "@/utils/storage";

const PREDICTION_TIMEOUT_MS = 90000;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("truthlens_user");
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  signup: (payload) => api.post("/auth/signup", payload),
  profile: () => api.get("/profile")
};

export const predictionApi = {
  predict: (payload) => api.post("/predict", payload, { timeout: PREDICTION_TIMEOUT_MS }),
  predictAndStore: (payload) =>
    api.post("/predict-and-store", payload, { timeout: PREDICTION_TIMEOUT_MS })
};

export const analyticsApi = {
  summary: () => api.get("/analytics")
};

export const blockchainApi = {
  verify: (hash) => api.get(`/verify/${hash}`)
};

export default api;
