import { LogOut, Settings } from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ThemeToggle } from "../../features/theme/ThemeToggle";

export function HeaderActions() {
  const { projectId } = useParams<{ projectId: string }>();
  const { can, signOut } = useAuth();

  const canManageAdmin = can("admin.manage_catalogs");

  return (
    <div className="flex items-center gap-2">
      {projectId && canManageAdmin && (
        <NavLink
          to={`/app/projects/${projectId}/admin`}
          className={({ isActive }) =>
            `inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${isActive
              ? "border-cyan-400/40 bg-cyan-400/20 text-cyan-200 light:border-cyan-300 light:bg-cyan-50 light:text-cyan-700"
              : "border-white/10 bg-white/10 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300 light:border-slate-200 light:bg-white light:text-slate-600 light:hover:border-cyan-300 light:hover:text-cyan-700"
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