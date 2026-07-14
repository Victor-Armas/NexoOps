import { useState } from "react";
import type { FormEvent } from "react";
import { UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import { Switch } from "../../../../components/ui/Switch";
import type {
  AdminProjectOption,
  AdminRoleOption,
  CreateAdminUserPayload,
} from "../types/user-settings-admin.types";
import { UserProjectSelector } from "./UserProjectSelector";

type CreateUserFormProps = {
  roles: AdminRoleOption[];
  projects: AdminProjectOption[];
  defaultProjectId: string;
  isSaving: boolean;
  onCancel: () => void;
  onCreate: (payload: CreateAdminUserPayload) => Promise<void>;
};

export function CreateUserForm({
  roles,
  projects,
  defaultProjectId,
  isSaving,
  onCancel,
  onCreate,
}: CreateUserFormProps) {
  const initialProjectIds = projects.some(
    (project) => project.id === defaultProjectId,
  )
    ? [defaultProjectId]
    : [];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [projectIds, setProjectIds] = useState<string[]>(initialProjectIds);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (fullName.trim().length < 3) {
      toast.error("Captura el nombre completo.");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Captura un correo válido.");
      return;
    }

    if (password.length < 8) {
      toast.error("La contraseña temporal debe tener al menos 8 caracteres.");
      return;
    }

    if (!roleId) {
      toast.error("Selecciona un rol.");
      return;
    }

    if (projectIds.length === 0) {
      toast.error("Asigna por lo menos un proyecto.");
      return;
    }

    await onCreate({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      roleId,
      projectIds,
      isActive,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-principal/40 bg-principal/5 p-4"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-barlow-condensed text-base font-bold uppercase tracking-[0.08em]">
            Crear usuario
          </p>
          <p className="mt-1 text-xs text-muted">
            Asigna el rol y los proyectos desde el inicio.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line text-muted transition hover:border-principal hover:text-principal"
          aria-label="Cerrar formulario"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Nombre completo"
          className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
        />

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="correo@empresa.com"
          className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña temporal"
          className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
        />

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Rol
          </span>
          <select
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
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
            Proyectos
          </span>
          <UserProjectSelector
            projects={projects}
            value={projectIds}
            disabled={isSaving}
            onChange={setProjectIds}
          />
        </div>

        <div className="flex min-h-11 items-center justify-between rounded-sm border border-line bg-surface-dark px-3">
          <span className="text-sm font-semibold">Usuario activo</span>
          <Switch
            checked={isActive}
            disabled={isSaving}
            onChange={(event) => setIsActive(event.target.checked)}
            aria-label="Usuario activo"
          />
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="h-11 w-full gap-2 rounded-sm bg-principal text-black hover:bg-principal/90"
        >
          <UserPlus size={16} />
          {isSaving ? "Creando..." : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
