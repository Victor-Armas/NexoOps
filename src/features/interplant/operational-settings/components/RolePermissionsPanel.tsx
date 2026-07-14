import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "../../../../components/ui/Switch";
import { cn } from "../../../../lib/utils/cn";
import {
  getRolePermissionSettings,
  saveRolePermission,
  type AdminPermission,
  type AdminRolePermissionGroup,
} from "../services/role-permissions-admin.service";

export function RolePermissionsPanel() {
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [roles, setRoles] = useState<AdminRolePermissionGroup[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await getRolePermissionSettings();

        if (isMounted) {
          setPermissions(data.permissions);
          setRoles(data.roles);
          setActiveRoleId((currentRoleId) =>
            currentRoleId && data.roles.some((role) => role.id === currentRoleId)
              ? currentRoleId
              : (data.roles[0]?.id ?? null),
          );
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar los permisos por rol.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeRole = useMemo(
    () => roles.find((role) => role.id === activeRoleId) ?? null,
    [activeRoleId, roles],
  );

  const handleToggle = async (params: {
    roleId: string;
    permissionId: string;
    isEnabled: boolean;
  }) => {
    const key = `${params.roleId}-${params.permissionId}`;

    try {
      setSavingKey(key);
      await saveRolePermission(params);

      setRoles((currentRoles) =>
        currentRoles.map((role) => {
          if (role.id !== params.roleId) {
            return role;
          }

          return {
            ...role,
            permissionIds: params.isEnabled
              ? [...new Set([...role.permissionIds, params.permissionId])]
              : role.permissionIds.filter(
                  (permissionId) => permissionId !== params.permissionId,
                ),
          };
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el permiso.",
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <p className="mb-2 font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Selecciona un rol
        </p>

        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRoleId(role.id)}
                className={cn(
                  "h-9 rounded-sm border px-3 font-ibm-plex-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition",
                  activeRoleId === role.id
                    ? "border-principal bg-principal text-black"
                    : "border-line-strong bg-panel text-muted hover:border-principal/60 hover:text-principal",
                )}
              >
                {role.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-sm border border-line bg-panel p-4 text-sm text-muted">
          Cargando permisos...
        </div>
      ) : !activeRole ? (
        <div className="rounded-sm border border-line bg-panel p-4 text-sm text-muted">
          No hay roles disponibles.
        </div>
      ) : (
        <>
          <article className="flex items-center gap-3 rounded-sm border border-line bg-panel p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-blue-400/30 bg-blue-400/10 text-blue-300">
              <ShieldCheck size={18} />
            </span>

            <span>
              <span className="block text-sm font-bold">{activeRole.name}</span>
              <span className="block text-xs text-muted">
                {activeRole.permissionIds.length} de {permissions.length} permisos activos
              </span>
            </span>
          </article>

          <div className="overflow-hidden rounded-sm border border-line bg-panel">
            {permissions.map((permission, index) => {
              const checked = activeRole.permissionIds.includes(permission.id);
              const key = `${activeRole.id}-${permission.id}`;

              return (
                <label
                  key={permission.id}
                  className={`flex min-h-14 items-center justify-between gap-3 px-3 py-2.5 ${
                    index > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {permission.name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {permission.description || permission.key}
                    </span>
                  </span>

                  <Switch
                    checked={checked}
                    disabled={savingKey === key}
                    onChange={(event) =>
                      void handleToggle({
                        roleId: activeRole.id,
                        permissionId: permission.id,
                        isEnabled: event.target.checked,
                      })
                    }
                    aria-label={`${checked ? "Desactivar" : "Activar"} ${permission.name}`}
                  />
                </label>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
