import { Moon, Sun } from "lucide-react";
import { useTheme } from "./useTheme";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-white/10 bg-white/10 p-2 text-slate-100 backdrop-blur transition hover:bg-white/20 dark:text-slate-100 light:border-slate-200 light:bg-white light:text-slate-700 light:shadow-sm"
            aria-label="Cambiar tema"
        >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}