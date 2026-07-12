import { useState } from "react";
import type { FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { updateCurrentUserPassword } from "../services/auth.service";

const secureFieldType = "password" as const;

export function ChangePasswordPage() {
  const [value, setValue] = useState("");
  const [repeatValue, setRepeatValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (value.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (value !== repeatValue) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsSaving(true);
      await updateCurrentUserPassword(value);
      window.location.assign("/app");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la contraseña.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white light:bg-slate-50 light:text-slate-950">
      <section className="w-full max-w-md rounded-4xl border border-white/10 bg-white/10 p-6 shadow-2xl light:border-slate-200 light:bg-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
          <KeyRound size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-bold">Crea tu nueva contraseña</h1>
        <p className="mt-2 text-sm text-slate-400 light:text-slate-500">
          Reemplaza la contraseña temporal antes de continuar a NexoOps.
        </p>

        {message && (
          <div className="mt-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Nueva contraseña</span>
            <input
              type={secureFieldType}
              minLength={8}
              autoComplete="new-password"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 outline-none focus:border-cyan-400 light:border-slate-200 light:bg-slate-50"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Confirmar contraseña</span>
            <input
              type={secureFieldType}
              minLength={8}
              autoComplete="new-password"
              value={repeatValue}
              onChange={(event) => setRepeatValue(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 outline-none focus:border-cyan-400 light:border-slate-200 light:bg-slate-50"
              required
            />
          </label>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-12 w-full rounded-2xl"
          >
            {isSaving ? "Guardando..." : "Guardar nueva contraseña"}
          </Button>
        </form>
      </section>
    </main>
  );
}
