// Description: A component that protects routes based on user roles and authentication status.

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types"; // Import the UserRole type
import { ROUTES } from "../constants"; // Import routes from constants
import LoadingSpinner from "./LoadingSpinner"; 
interface ProtectedRouteProps {
  allowedRoles: UserRole[]; // Array of allowed roles for this route
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Make sure role is treated as UserRole and is allowed to access this route
  if (!role || !allowedRoles.includes(role)) {
    console.warn(`Unauthorized Access: Role ${role} cannot access this route`);
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;