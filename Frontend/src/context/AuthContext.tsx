// Description: This file contains the AuthContext and AuthProvider components, which manage authentication state in a React application. 
// It uses cookie-based authentication and checks the current user's auth status when the app loads.

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserRole } from "../types";
import { checkAuthStatus } from "../Services/authService";

// Define the shape of the context
interface AuthContextType {
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Create context with a default value that matches the shape
const AuthContext = createContext<AuthContextType>({
  role: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true
});

// Wrap the application with this provider (app.tsx) which will provide the context to all components
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component to manage authentication state
// This component will wrap around the parts of the app that need access to authentication state
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State variables for role and authentication status
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status when the component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await checkAuthStatus();
        
        if (authStatus.authenticated && authStatus.role) {
          // User is authenticated
          setRole(authStatus.role as UserRole);
          setIsAuthenticated(true);
        } else {
          // User is not authenticated
          setRole(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Error checking authentication status
        setRole(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Function to handle login
  const login = (newRole: UserRole): void => {
    setRole(newRole);
    setIsAuthenticated(true);
  };

  // Function to handle logout
  const logout = (): void => {
    setRole(null);
    setIsAuthenticated(false);
  };

  // Context value to be provided to components
  const contextValue: AuthContextType = {
    role,
    login,
    logout,
    isAuthenticated,
    isLoading
  };

  // Provide the context value to children components
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context in components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};