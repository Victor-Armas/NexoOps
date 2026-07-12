import { UsersRound } from "lucide-react";
import { toast } from "sonner";
import { CreateUserForm } from "./CreateUserForm";
import { UserSettingForm } from "./UserSettingForm";
import { useUserSettingsAdmin } from "../hooks/useUserSettingsAdmin";
import type {
  CreateAdminUserPayload,
  SaveAdminUserSettingPayload,
} from "../types/user-settings-admin.types";

type UserSettingsPanelProps = {
  currentUserId: string;
  canManagePermissions: boolean;
};

export function UserSettingsPanel({
  currentUserId,
  canManagePermissions,
}: UserSettingsPanelProps) {
  const {
    users,
    roles,
    isLoading,
    isSaving,
    errorMessage,
    createUser,
    saveUser,
  } = useUserSettingsAdmin();

  const handleCreate = async (values: CreateAdminUserPayload) => {
    try {
      await createUser(values);
      toast.success("Usuario creado correctamente.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear el usuario.",
      );
      throw error;
    }
  };

  const handleSave = async (values: SaveAdminUserSettingPayload) => {
    try {
      await saveUser(values);
      toast.success("Usuario guardado.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar el usuario.",
      );
    }
  };

  if (!canManagePermissions) {
    return null;
  }

  return (
    <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
          <UsersRound size={22} />
        </div>

        <div>
          <h3 className="text-lg font-bold">Usuarios y roles</h3>

          <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
            Crea accesos y administra el rol operativo de cada usuario.
          </p>
        </div>
      </div>

      {errorMessage && (
        <section className="mb-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
      )}

      {isLoading ? (
        <section className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400 light:border-slate-200 light:bg-slate-50 light:text-slate-500">
          Cargando usuarios...
        </section>
      ) : roles.length === 0 ? (
        <section className="rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-100 light:text-yellow-700">
          No hay roles disponibles para asignar.
        </section>
      ) : (
        <>
          <CreateUserForm
            roles={roles}
            isSaving={isSaving}
            onCreate={handleCreate}
          />

          {users.length === 0 ? (
            <section className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400 light:border-slate-200 light:bg-slate-50 light:text-slate-500">
              No hay usuarios registrados.
            </section>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <UserSettingForm
                  key={`${user.id}-${user.updatedAt}`}
                  user={user}
                  roles={roles}
                  currentUserId={currentUserId}
                  isSaving={isSaving}
                  onSave={handleSave}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
