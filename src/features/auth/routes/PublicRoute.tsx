import { Navigate, Outlet } from "react-router-dom";
import { LoadingScreen } from "../../../components/layout/LoadingScreen";
import { useAuth } from "../hooks/useAuth";

export function PublicRoute() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (session) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
