// This file contains API calls related to user authentication and management
import axios from "axios"; // Import axios for making HTTP requests

// Import constants and types
import { API_ROUTES } from "../constants";
import { User, SignupData, LoginCredentials, ApiError } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Read from .env file

// Configure axios to include credentials with requests
axios.defaults.withCredentials = true;

// Type for the profile response
interface ProfileResponse {
  id: number;
  email: string;
  role: string;
  name?: string;
  dateCreated?: string;
}

// Type for auth status response
interface AuthStatusResponse {
  authenticated: boolean;
  role?: string;
}

// This function will make a POST request to the signup endpoint
export const signUpUser = async (userData: SignupData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${API_ROUTES.SIGNUP}`, userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Signup failed";
  }
};

// Updated login function
export const loginUser = async (credentials: LoginCredentials): Promise<{ user: User }> => {
  try {
    const response = await axios.post<{ user: User }>(`${API_BASE_URL}${API_ROUTES.LOGIN}`, credentials);
    return response.data;
  } catch (error: any) {
    const apiError: ApiError = {
      message: error.response?.data?.message || "Login failed",
      status: error.response?.status,
      data: error.response?.data
    };
    throw apiError;
  }
};

// Logout function
export const logoutUser = async (): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}${API_ROUTES.LOGOUT}`);
  } catch (error: any) {
    console.error("Logout failed:", error);
    throw error.response?.data || "Logout failed";
  }
};

// Get user profile function
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await axios.get<ProfileResponse>(`${API_BASE_URL}/user/profile`);
    
    // Convert the response to User type
    const user: User = {
      id: response.data.id,
      email: response.data.email,
      role: response.data.role as any // Enum conversion if needed
    };
    
    return user;
  } catch (error: any) {
    throw error.response?.data || "Failed to get user profile";
  }
};

// Check auth status with proper typing
export const checkAuthStatus = async (): Promise<{ authenticated: boolean; role?: string }> => {
  try {
    const response = await axios.get<AuthStatusResponse>(`${API_BASE_URL}/user/check-auth`);
    return response.data;
  } catch (error: any) {
    return { authenticated: false };
  }
};