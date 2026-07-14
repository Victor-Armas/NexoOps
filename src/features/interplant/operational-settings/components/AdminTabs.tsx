import { cn } from "../../../../lib/utils/cn";

export type AdminTab =
  | "operacion"
  | "plantas"
  | "unidades"
  | "movimientos"
  | "incidencias"
  | "usuarios"
  | "permisos";

type AdminTabItem = {
  value: AdminTab;
  label: string;
  permission?: "permissions" | "incidentCategories";
};

const ADMIN_TABS: AdminTabItem[] = [
  { value: "operacion", label: "Operación" },
  { value: "plantas", label: "Plantas" },
  { value: "unidades", label: "Unidades" },
  { value: "movimientos", label: "Movimientos" },
  {
    value: "incidencias",
    label: "Incidencias",
    permission: "incidentCategories",
  },
  { value: "usuarios", label: "Usuarios", permission: "permissions" },
  { value: "permisos", label: "Permisos", permission: "permissions" },
];

type AdminTabsProps = {
  activeTab: AdminTab;
  canManagePermissions: boolean;
  canManageIncidentCategories: boolean;
  onChange: (tab: AdminTab) => void;
};

export function AdminTabs({
  activeTab,
  canManagePermissions,
  canManageIncidentCategories,
  onChange,
}: AdminTabsProps) {
  const visibleTabs = ADMIN_TABS.filter((tab) => {
    if (tab.permission === "permissions") {
      return canManagePermissions;
    }

    if (tab.permission === "incidentCategories") {
      return canManageIncidentCategories;
    }

    return true;
  });

  return (
    <nav className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-2 border-b border-line pb-3">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "h-9 rounded-sm border px-3 font-ibm-plex-mono text-[9px] font-semibold uppercase tracking-[0.08em] transition",
                isActive
                  ? "border-principal bg-principal text-black"
                  : "border-line-strong bg-panel text-muted hover:border-principal/60 hover:text-principal",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
