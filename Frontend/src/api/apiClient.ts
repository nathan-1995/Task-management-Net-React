// Description: This file contains the API client configuration using Axios.
// It sets up the base URL, headers, and interceptors for handling responses and errors globally.

import axios from "axios";
import { ROUTES } from "../constants";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Handle session expiration globally except during login/signup
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    // Only redirect on 401 if NOT on login or signup page
    if (
      status === 401 &&
      currentPath !== ROUTES.LOGIN &&
      currentPath !== ROUTES.SIGNUP
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = ROUTES.LOGIN;
    }

    return Promise.reject(error);
  }
);

// Optional: Helper for displaying user-friendly messages
const handleApiError = (error: any) => {
  if (!error.response) {
    return "Network error. Please check your connection.";
  }

  switch (error.response.status) {
    case 400:
      return error.response.data.message || "Invalid request.";
    case 401:
      return "Unauthorized. Please check your login details.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "Requested resource not found.";
    case 500:
      return "Internal server error. Please try again later.";
    default:
      return "An unexpected error occurred.";
  }
};

export { apiClient, handleApiError };
