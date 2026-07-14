import { useMemo, useState } from "react";
import { ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import { Switch } from "../../../../components/ui/Switch";
import { cn } from "../../../../lib/utils/cn";
import type {
  AdminProjectOption,
  AdminRoleOption,
  AdminUserSetting,
  SaveAdminUserSettingPayload,
} from "../types/user-settings-admin.types";
import { UserProjectSelector } from "./UserProjectSelector";

type UserSettingFormProps = {
  user: AdminUserSetting;
  roles: AdminRoleOption[];
  projects: AdminProjectOption[];
  currentUserId: string;
  isSaving: boolean;
  onSave: (values: SaveAdminUserSettingPayload) => Promise<void>;
};

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserSettingForm({
  user,
  roles,
  projects,
  currentUserId,
  isSaving,
  onSave,
}: UserSettingFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [roleId, setRoleId] = useState(user.roleId);
  const [projectIds, setProjectIds] = useState(user.projectIds);
  const [isActive, setIsActive] = useState(user.isActive);
  const isCurrentUser = user.id === currentUserId;

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === roleId),
    [roleId, roles],
  );

  const handleSave = async () => {
    if (!roleId) {
      toast.error("Selecciona un rol para el usuario.");
      return;
    }

    if (projectIds.length === 0) {
      toast.error("Asigna por lo menos un proyecto.");
      return;
    }

    if (isCurrentUser && !isActive) {
      toast.error("No puedes desactivar tu propio usuario.");
      return;
    }

    await onSave({
      userId: user.id,
      roleId,
      projectIds,
      isActive,
    });

    setIsExpanded(false);
  };

  const handleActiveChange = async (nextIsActive: boolean) => {
    if (isCurrentUser && !nextIsActive) {
      toast.error("No puedes desactivar tu propio usuario.");
      return;
    }

    setIsActive(nextIsActive);

    try {
      await onSave({
        userId: user.id,
        roleId,
        projectIds,
        isActive: nextIsActive,
      });
    } catch {
      setIsActive(!nextIsActive);
    }
  };

  return (
    <article
      className={cn(
        "overflow-hidden rounded-sm border border-line bg-panel",
        !isActive && "opacity-60",
      )}
    >
      <div className="flex min-h-16 items-center gap-3 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-surface-dark font-ibm-plex-mono text-[11px] font-semibold text-muted">
            {getInitials(user.fullName)}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">
              {user.fullName}
            </span>
            <span className="block truncate text-xs text-muted">{user.email}</span>
          </span>

          <span className="shrink-0 rounded-sm border border-principal/50 px-2 py-1 font-ibm-plex-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-principal">
            {selectedRole?.name ?? "Sin rol"}
          </span>

          <ChevronDown
            size={15}
            className={cn(
              "shrink-0 text-muted transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </button>

        <Switch
          checked={isActive}
          disabled={isSaving || isCurrentUser}
          onChange={(event) => void handleActiveChange(event.target.checked)}
          aria-label={`${isActive ? "Desactivar" : "Activar"} ${user.fullName}`}
        />
      </div>

      {isExpanded && (
        <div className="space-y-3 border-t border-line bg-surface-dark/50 p-3">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Rol
            </span>
            <select
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Proyectos asignados
            </span>
            <UserProjectSelector
              projects={projects}
              value={projectIds}
              disabled={isSaving}
              onChange={setProjectIds}
            />
          </div>

          {isCurrentUser && (
            <p className="text-xs leading-5 text-muted">
              Este es tu usuario actual y no puede desactivarse desde aquí.
            </p>
          )}

          <Button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
            className="h-10 w-full gap-2 rounded-sm"
          >
            <Save size={15} />
            Guardar usuario
          </Button>
        </div>
      )}
    </article>
  );
}
