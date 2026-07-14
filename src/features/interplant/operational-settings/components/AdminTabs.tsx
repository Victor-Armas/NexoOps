import type { ComponentType } from "react";
import {
    Factory,
    Settings2,
    ShieldCheck,
    Truck,
    UsersRound,
    Waypoints,
} from "lucide-react";
import { cn } from "../../../../lib/utils/cn";

export type AdminTab =
    | "operacion"
    | "plantas"
    | "unidades"
    | "movimientos"
    | "usuarios"
    | "permisos";

type AdminTabItem = {
    value: AdminTab;
    label: string;
    icon: ComponentType<{ size?: number }>;
    requiresPermissions?: boolean;
};

const ADMIN_TABS: AdminTabItem[] = [
    {
        value: "operacion",
        label: "Operación",
        icon: Settings2,
    },
    {
        value: "plantas",
        label: "Plantas",
        icon: Factory,
    },
    {
        value: "unidades",
        label: "Unidades",
        icon: Truck,
    },
    {
        value: "movimientos",
        label: "Movimientos",
        icon: Waypoints,
    },
    {
        value: "usuarios",
        label: "Usuarios",
        icon: UsersRound,
        requiresPermissions: true,
    },
    {
        value: "permisos",
        label: "Permisos",
        icon: ShieldCheck,
        requiresPermissions: true,
    },
];

type AdminTabsProps = {
    activeTab: AdminTab;
    canManagePermissions: boolean;
    onChange: (tab: AdminTab) => void;
};

export function AdminTabs({
    activeTab,
    canManagePermissions,
    onChange,
}: AdminTabsProps) {
    const visibleTabs = ADMIN_TABS.filter(
        (tab) => !tab.requiresPermissions || canManagePermissions,
    );

    return (
        <nav className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2 border-b border-line pb-3">
                {visibleTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onChange(tab.value)}
                            className={cn(
                                "inline-flex h-10 items-center gap-2 rounded-sm border px-3 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.08em] transition",
                                isActive
                                    ? "border-principal bg-principal text-black"
                                    : "border-line-strong bg-panel text-muted hover:border-principal/60 hover:text-principal",
                            )}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}