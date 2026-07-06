import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { HomePage } from "../features/home/HomePage";
import { PublicRoute } from "../features/auth/routes/PublicRoute";
import { ProtectedRoute } from "../features/auth/routes/ProtectedRoute";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<HomePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}