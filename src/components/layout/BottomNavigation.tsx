import { BarChart3, Factory, Home, Truck, TriangleAlert } from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import { cn } from "../../lib/utils/cn";

export function BottomNavigation() {
    const { projectId } = useParams();

    const basePath = `/app/projects/${projectId}`;

    const navItems = [
        {
            label: "Inicio",
            to: basePath,
            icon: Home,
            end: true,
        },
        {
            label: "Plantas",
            to: `${basePath}/plants`,
            icon: Factory,
        },
        {
            label: "Unidades",
            to: `${basePath}/units`,
            icon: Truck,
        },
        {
            label: "Incidencias",
            to: `${basePath}/incidents`,
            icon: TriangleAlert,
        },
        {
            label: "Cierre",
            to: `${basePath}/closing`,
            icon: BarChart3,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 px-3 py-2 backdrop-blur-xl light:border-slate-200 light:bg-white/90">
            <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                cn(
                                    "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium text-slate-400 transition",
                                    isActive &&
                                    "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20",
                                )
                            }
                        >
                            <Icon size={19} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}