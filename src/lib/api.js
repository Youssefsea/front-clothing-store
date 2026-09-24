// Centralized API client for all backend requests
import axios from "axios";

const API_BASE_URL = "https://backendclothes.vercel.app";

// Create axios instance with proper credentials handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // Critical: Include credentials for HTTP-only cookie auth
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error structure
    const normalizedError = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      endpoint: error.config?.url,
    };

    // Handle auth errors (401 Unauthorized)
    if (error.response?.status === 401) {
      // Clear any local state if needed
      if (typeof window !== "undefined") {
        // Redirect to login on unauthorized
        window.location.href = "/login";
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
