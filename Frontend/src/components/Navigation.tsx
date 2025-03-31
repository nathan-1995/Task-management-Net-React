// Description: Navigation component for the application, handles routing and user authentication state.
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { UserRole } from "../types";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../Services/authService";

const Navigation = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the API to clear the cookie on the server
      await logoutUser();
      
      // Update the local auth context state
      logout();
      
      // Navigate to login page
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally and redirect even if server request fails
      logout();
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        {/* Left side nav */}
        <div className="flex space-x-4">
          {role && (
            <>
              <Link to={ROUTES.DASHBOARD} className="hover:text-gray-300">Dashboard</Link>
              {role === UserRole.Admin && (
                <Link to={ROUTES.ADMIN} className="hover:text-gray-300">Admin Panel</Link>
              )}
            </>
          )}
        </div>

        {/* Right side nav */}
        <div>
          {role ? (
            <button onClick={handleLogout} className="hover:text-gray-300">Logout</button>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="hover:text-gray-300 mr-4">Login</Link>
              <Link to={ROUTES.SIGNUP} className="hover:text-gray-300">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;