import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../features/auth/routes/ProtectedRoute";
import { PublicRoute } from "../features/auth/routes/PublicRoute";
import { UnauthorizedPage } from "../features/auth/pages/UnauthorizedPage";
import { NotFoundPage } from "../features/auth/pages/NotFoundPage";
import { HomePage } from "../features/Home/pages/HomePage";
import { AppShell } from "../components/layout/AppShell";
import { PlantsPage } from "../features/Plants/page/PlantsPage";
import { UnitsPage } from "../features/units/pages/UnitsPage";
import { ProjectMenuPage } from "../features/projects/pages/ProjectMenuPage";
import { ProjectShell } from "../components/layout/ProjectShell";


export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>

            <Route path="/app" element={<AppShell />}>
              <Route index element={<ProjectMenuPage />} />
            </Route>


            <Route path="/app/projects/:projectId" element={<ProjectShell />}>
              <Route index element={<HomePage />} />
              <Route path="plants" element={<PlantsPage />} />
              <Route path="units" element={<UnitsPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}