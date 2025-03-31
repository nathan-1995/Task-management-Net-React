// description: This file contains the AdminPanel component, which is used to manage admin functionalities in the application.
import { ROUTES } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// AdminPanel Component
const AdminPanel = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
  
    const handleLogout = () => {
      logout();
      navigate(ROUTES.LOGIN);
    };
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-semibold mb-4">Admin Panel</h2>
        <p>Welcome, Admin. You can manage users and settings here.</p>
        <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
      </div>
    );
  };
  
  export default AdminPanel;
  