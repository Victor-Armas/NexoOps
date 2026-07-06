import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingScreen } from "../../../components/layout/LoadingScreen";

export function ProtectedRoute() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                return <LoadingScreen />;
            </main>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}