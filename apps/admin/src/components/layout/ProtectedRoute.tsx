import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { permissionForPath } from "@/config/route-permissions";

export default function ProtectedRoute() {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const required = permissionForPath(location.pathname);
  if (required && !hasPermission(required)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
