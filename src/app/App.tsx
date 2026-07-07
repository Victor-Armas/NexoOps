import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../features/auth/routes/ProtectedRoute";
import { PublicRoute } from "../features/auth/routes/PublicRoute";
import { UnauthorizedPage } from "../features/auth/pages/UnauthorizedPage";
import { NotFoundPage } from "../features/auth/pages/NotFoundPage";
import { PlantsPage } from "../features/interplant/plants/pages/PlantsPage";
import { UnitsPage } from "../features/interplant/units/pages/UnitsPage";
import { IncidentsPage } from "../features/interplant/incidents/pages/IncidentsPage";
import { ClosingPage } from "../features/interplant/closing/pages/ClosingPage";
import { ProjectMenuPage } from "../features/projects/pages/ProjectMenuPage";
import { AppShell } from "../components/layout/AppShell";
import { ProjectShell } from "../components/layout/ProjectShell";
import { InterplantDashboardPage } from "../features/interplant/dashboard/pages/InterplantDashboardPage";
import { Toaster } from "sonner";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-center" />
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
              <Route index element={<InterplantDashboardPage />} />
              <Route path="plants" element={<PlantsPage />} />
              <Route path="units" element={<UnitsPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="closing" element={<ClosingPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
