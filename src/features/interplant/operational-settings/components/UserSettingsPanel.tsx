import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
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
  defaultProjectId: string;
};

export function UserSettingsPanel({
  currentUserId,
  defaultProjectId,
}: UserSettingsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    users,
    roles,
    projects,
    isLoading,
    isSaving,
    errorMessage,
    createUser,
    saveUser,
  } = useUserSettingsAdmin();

  const visibleUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("es-MX");

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) =>
      `${user.fullName} ${user.email}`
        .toLocaleLowerCase("es-MX")
        .includes(normalizedSearch),
    );
  }, [searchTerm, users]);

  const handleCreate = async (values: CreateAdminUserPayload) => {
    try {
      await createUser(values);
      toast.success("Usuario creado correctamente.");
      setIsCreateOpen(false);
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
      throw error;
    }
  };

  return (
    <section className="space-y-4">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="h-11 w-full rounded-sm border border-line-strong bg-panel pl-10 pr-3 text-sm outline-none focus:border-principal"
        />
      </div>

      <button
        type="button"
        onClick={() => setIsCreateOpen((current) => !current)}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-principal font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] text-black transition hover:bg-principal/90"
      >
        <UserPlus size={16} />
        Crear usuario
      </button>

      {isCreateOpen && (
        <CreateUserForm
          roles={roles}
          projects={projects}
          defaultProjectId={defaultProjectId}
          isSaving={isSaving}
          onCancel={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {errorMessage && (
        <section className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
      )}

      <div className="flex items-center gap-2">
        <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {visibleUsers.length} usuarios
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {isLoading ? (
        <section className="rounded-sm border border-line bg-panel p-4 text-sm text-muted">
          Cargando usuarios...
        </section>
      ) : roles.length === 0 ? (
        <section className="rounded-sm border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-100 light:text-yellow-700">
          No hay roles disponibles para asignar.
        </section>
      ) : visibleUsers.length === 0 ? (
        <section className="rounded-sm border border-line bg-panel p-4 text-sm text-muted">
          No se encontraron usuarios.
        </section>
      ) : (
        <div className="space-y-2">
          {visibleUsers.map((user) => (
            <UserSettingForm
              key={`${user.id}-${user.updatedAt}`}
              user={user}
              roles={roles}
              projects={projects}
              currentUserId={currentUserId}
              isSaving={isSaving}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </section>
  );
}
