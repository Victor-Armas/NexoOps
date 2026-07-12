import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  getRolePermissionSettings,
  saveRolePermission,
  type AdminPermission,
  type AdminRolePermissionGroup,
} from "../services/role-permissions-admin.service";

export function RolePermissionsPanel() {
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [roles, setRoles] = useState<AdminRolePermissionGroup[]>([]);
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
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar los permisos por rol.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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
          if (role.id !== params.roleId) return role;

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

      toast.success("Permiso actualizado.");
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
    <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300 light:bg-violet-100 light:text-violet-700">
          <ShieldCheck size={22} />
        </div>

        <div>
          <h3 className="text-lg font-bold">Permisos por rol</h3>
          <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
            Define qué acciones puede realizar cada rol dentro de NexoOps.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl bg-slate-950/30 p-4 text-sm text-slate-400 light:bg-slate-50 light:text-slate-500">
          Cargando permisos...
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <article
              key={role.id}
              className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50"
            >
              <div className="mb-3">
                <h4 className="font-bold">{role.name}</h4>
                <p className="text-xs text-slate-500">{role.key}</p>
              </div>

              <div className="space-y-2">
                {permissions.map((permission) => {
                  const checked = role.permissionIds.includes(permission.id);
                  const key = `${role.id}-${permission.id}`;

                  return (
                    <label
                      key={permission.id}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-3 light:border-slate-200 light:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={savingKey === key}
                        onChange={(event) =>
                          void handleToggle({
                            roleId: role.id,
                            permissionId: permission.id,
                            isEnabled: event.target.checked,
                          })
                        }
                        className="mt-1 h-4 w-4"
                      />

                      <span>
                        <span className="block text-sm font-semibold">
                          {permission.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {permission.description || permission.key}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
