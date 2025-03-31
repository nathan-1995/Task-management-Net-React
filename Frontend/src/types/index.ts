// This file contains TypeScript interfaces and types for authentication-related data structures.
// It includes user roles, login credentials, signup data, API errors, and authentication responses.

export enum UserRole {
  Admin = "Admin",
  Customer = "Customer",
}

export interface User {
  id: number; 
  email: string;
  role: UserRole;
}

export interface LoginFormInputs {
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;

}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface AuthContextType {
  token: string | null;
  role: UserRole | null;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export class AuthError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number = 400, data?: any) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.data = data;
  }
}