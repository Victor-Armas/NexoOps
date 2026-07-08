import { LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ThemeToggle } from "../../features/theme/ThemeToggle";

export function HeaderActions() {
  const { signOut } = useAuth();

  return (
    <div className="flex items-center gap-2">
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
