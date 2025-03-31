// Description: Main application component that sets up routing and navigation.

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import LoginPage from "./pages/LoginPage"; // Updated to use LoginPage
import SignUp from "./components/SignUp";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserRole } from "./types";
import { ROUTES } from "./constants"; // Import centralized routes

function App() {
  const location = useLocation();
  const isAuthPage = [ROUTES.LOGIN, ROUTES.SIGNUP].includes(location.pathname); // Hide Navigation on Auth Pages

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {!isAuthPage && <Navigation />} {/* Hide navigation on Login & SignUp */}

      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignUp />} />

        {/* Protected Dashboard (Both Users & Admins Can Access) */}
        <Route element={<ProtectedRoute allowedRoles={["Admin", "Customer"] as UserRole[]} />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        </Route>

        {/* Protected Admin Panel (Admins Only) */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"] as UserRole[]} />}>
          <Route path={ROUTES.ADMIN} element={<AdminPanel />} />
        </Route>

        {/* Default Route */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </div>
  );
}

export default App;
