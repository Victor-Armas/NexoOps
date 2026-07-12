import { useState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type {
  AdminRoleOption,
  AdminUserSetting,
  SaveAdminUserSettingPayload,
} from "../types/user-settings-admin.types";

type UserSettingFormProps = {
  user: AdminUserSetting;
  roles: AdminRoleOption[];
  currentUserId: string;
  isSaving: boolean;
  onSave: (values: SaveAdminUserSettingPayload) => Promise<void>;
};

export function UserSettingForm({
  user,
  roles,
  currentUserId,
  isSaving,
  onSave,
}: UserSettingFormProps) {
  const [roleId, setRoleId] = useState(user.roleId);
  const [isActive, setIsActive] = useState(user.isActive);
  const isCurrentUser = user.id === currentUserId;

  const handleSave = async () => {
    if (!roleId) {
      toast.error("Selecciona un rol para el usuario.");
      return;
    }

    if (isCurrentUser && !isActive) {
      toast.error("No puedes desactivar tu propio usuario.");
      return;
    }

    await onSave({
      userId: user.id,
      roleId,
      isActive,
    });
  };

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-bold">{user.fullName}</h4>
          <p className="text-sm text-slate-400 light:text-slate-500">
            {user.email}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            user.isActive
              ? "bg-emerald-400/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700"
              : "bg-red-500/10 text-red-300 light:bg-red-50 light:text-red-600"
          }`}
        >
          {user.isActive ? "Activo" : "Inactivo"}
        </span>
      </div>

      {isCurrentUser && (
        <section className="mb-3 rounded-3xl bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200 light:bg-cyan-50 light:text-cyan-700">
          Este es tu usuario actual. Puedes cambiar tu rol, pero no puedes
          desactivarte desde aquí.
        </section>
      )}

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
            Rol
          </span>

          <select
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.key}){role.isActive ? "" : " - inactivo"}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-300 light:text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            disabled={isCurrentUser}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4"
          />
          Usuario activo
        </label>

        <Button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="h-11 w-full gap-2 rounded-2xl"
        >
          <Save size={16} />
          Guardar usuario
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck size={14} />
        Los permisos efectivos dependen del rol asignado.
      </div>
    </article>
  );
}
