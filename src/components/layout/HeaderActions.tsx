import {
  ChartNoAxesCombined,
  LogOut,
  RadioTower,
  Settings,
} from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ThemeToggle } from "../../features/theme/ThemeToggle";

export function HeaderActions() {
  const { projectId } = useParams<{ projectId: string }>();
  const { can, signOut } = useAuth();

  const canManageAdmin = can("admin.manage_catalogs");
  const canViewReports = can("reports.view");
  const canViewControlTower = can("control_tower.view");

  return (
    <div className="flex items-center gap-2">
      {projectId && canViewControlTower && (
        <NavLink
          to={`/app/projects/${projectId}/control-tower`}
          className={({ isActive }) =>
            `inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
              isActive
                ? "border-principal/40 bg-principal/20 text-principal"
                : "border-white/10 bg-white/10 text-slate-300 hover:border-principal/40 hover:text-principal light:border-slate-200 light:bg-white light:text-slate-600"
            }`
          }
          aria-label="Torre de control"
          title="Torre de control"
        >
          <RadioTower size={17} />
        </NavLink>
      )}

      {projectId && canViewReports && (
        <NavLink
          to={`/app/projects/${projectId}/history`}
          className={({ isActive }) =>
            `inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
              isActive
                ? "border-principal/40 bg-principal/20 text-principal"
                : "border-white/10 bg-white/10 text-slate-300 hover:border-principal/40 hover:text-principal light:border-slate-200 light:bg-white light:text-slate-600"
            }`
          }
          aria-label="Historial operativo"
          title="Historial operativo"
        >
          <ChartNoAxesCombined size={17} />
        </NavLink>
      )}

      {projectId && canManageAdmin && (
        <NavLink
          to={`/app/projects/${projectId}/admin`}
          className={({ isActive }) =>
            `inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
              isActive
                ? "border-principal/40 bg-principal/20 text-principal"
                : "border-white/10 bg-white/10 text-slate-300 hover:border-principal/40 hover:text-principal light:border-slate-200 light:bg-white light:text-slate-600"
            }`
          }
          aria-label="Panel administrativo"
          title="Panel administrativo"
        >
          <Settings size={17} />
        </NavLink>
      )}

      <ThemeToggle />

      <button
        type="button"
        onClick={() => void signOut()}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-300 transition hover:border-red-400/40 hover:text-red-300 light:border-slate-200 light:bg-white light:text-slate-600 light:hover:border-red-300 light:hover:text-red-600"
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut size={17} />
      </button>
    </div>
  );
}
