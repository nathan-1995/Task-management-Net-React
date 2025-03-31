// LoginPage where the user can login to the application
import Login from "../components/Login";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types"

const LoginPage = () => {
  const { role } = useAuth();

  if (role === UserRole.Admin) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  if (role) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Login />
    </div>
  );
};

export default LoginPage;
