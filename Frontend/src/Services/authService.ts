// Description: This file contains functions for handling authentication-related API calls
// such as login, logout, and user profile retrieval. It uses axios for HTTP requests and handles errors appropriately.

import axios from "axios";
import { User, LoginCredentials, UserRole, ApiError, SignupData } from "../types";
import { API_ROUTES } from "../constants";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configure axios to include credentials with requests
axios.defaults.withCredentials = true;

// Interface for login response
interface LoginResponse {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

//Logs in a user with the provided credentials
export const loginUser = async (credentials: LoginCredentials): Promise<{ user: User }> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}${API_ROUTES.LOGIN}`, credentials);
    
    // Convert the string role to UserRole enum
    const userWithEnumRole: User = {
      id: response.data.user.id,
      email: response.data.user.email,
      role: response.data.user.role as UserRole
    };
    
    return { user: userWithEnumRole };
  } catch (error: any) {
    const apiError: ApiError = {
      message: error.response?.data?.message || "Login failed",
      status: error.response?.status,
      data: error.response?.data
    };
    throw apiError;
  }
};

// Signs up a new user with the provided data
export const signUpUser = async (userData: SignupData): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}${API_ROUTES.SIGNUP}`, userData);
    return response.data;
  } catch (error: any) {
    const apiError: ApiError = {
      message: error.response?.data?.message || "Signup failed",
      status: error.response?.status,
      data: error.response?.data
    };
    throw apiError;
  }
};

// Logs out the current user
export const logoutUser = async (): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}${API_ROUTES.LOGOUT}`);
  } catch (error: any) {
    console.error("Logout failed:", error);
    throw error.response?.data || "Logout failed";
  }
};

// Retrieves the current user's profile
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await axios.get<User>(`${API_BASE_URL}/user/profile`);
    
    // Ensure role is converted to UserRole enum
    const userWithEnumRole: User = {
      id: response.data.id,
      email: response.data.email,
      role: response.data.role as UserRole
    };
    
    return userWithEnumRole;
  } catch (error: any) {
    throw error.response?.data || "Failed to get user profile";
  }
};

// Checks the authentication status of the user
export const checkAuthStatus = async (): Promise<{authenticated: boolean, role?: string}> => {
  try {
    const response = await axios.get<{authenticated: boolean, role?: string}>(`${API_BASE_URL}/user/check-auth`);
    return response.data;
  } catch (error: any) {
    return { authenticated: false };
  }
};