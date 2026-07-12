import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingScreen } from "../../../components/layout/LoadingScreen";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { session, profile, isLoading } = useAuth();
  const location = useLocation();

  const isAuthenticated = Boolean(session && profile);
  const isPasswordChangeRoute = location.pathname === "/change-password";

  if (isLoading && !isAuthenticated) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (profile.mustChangePassword && !isPasswordChangeRoute) {
    return <Navigate to="/change-password" replace />;
  }

  if (!profile.mustChangePassword && isPasswordChangeRoute) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
