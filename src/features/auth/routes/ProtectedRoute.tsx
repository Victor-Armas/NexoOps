import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingScreen } from "../../../components/layout/LoadingScreen";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
    const { session, profile, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!session) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (!profile) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}