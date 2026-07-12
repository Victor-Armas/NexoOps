import { useState } from "react";
import type { FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type {
  AdminRoleOption,
  CreateAdminUserPayload,
} from "../types/user-settings-admin.types";

type CreateUserFormProps = {
  roles: AdminRoleOption[];
  isSaving: boolean;
  onCreate: (payload: CreateAdminUserPayload) => Promise<void>;
};

export function CreateUserForm({
  roles,
  isSaving,
  onCreate,
}: CreateUserFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
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

    await onCreate({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      roleId,
      isActive,
    });

    setFullName("");
    setEmail("");
    setPassword("");
    setRoleId(roles[0]?.id ?? "");
    setIsActive(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4"
    >
      <div className="mb-4">
        <h4 className="font-bold">Crear usuario</h4>
        <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
          Crea el acceso y asigna el rol operativo inicial.
        </p>
      </div>

      <div className="space-y-3">
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Nombre completo"
          className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
        />

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="correo@empresa.com"
          className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña temporal"
          className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
        />

        <select
          value={roleId}
          onChange={(event) => setRoleId(event.target.value)}
          className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} ({role.key})
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 text-sm text-slate-300 light:text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4"
          />
          Usuario activo
        </label>

        <Button
          type="submit"
          disabled={isSaving}
          className="h-11 w-full gap-2 rounded-2xl"
        >
          <UserPlus size={16} />
          {isSaving ? "Creando..." : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
