import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { Button } from "../../../../components/ui/Button";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useOperationalSettings } from "../hooks/useOperationalSettings";
import type { OperationalSettings } from "../types/operational-settings.types";

type OperationalSettingsFormProps = {
    settings: OperationalSettings;
    projectId: string;
    profileId: string;
    isSaving: boolean;
    onSave: Parameters<typeof useOperationalSettings>[0] extends never
    ? never
    : ReturnType<typeof useOperationalSettings>["saveSettings"];
};

function OperationalSettingsForm({
    settings,
    projectId,
    profileId,
    isSaving,
    onSave,
}: OperationalSettingsFormProps) {
    const [mealTargetMinutes, setMealTargetMinutes] = useState(
        String(settings.mealTargetMinutes),
    );
    const [mealDelayLimitMinutes, setMealDelayLimitMinutes] = useState(
        String(settings.mealDelayLimitMinutes),
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextMealTargetMinutes = Number(mealTargetMinutes);
        const nextMealDelayLimitMinutes = Number(mealDelayLimitMinutes);

        if (!Number.isInteger(nextMealTargetMinutes) || nextMealTargetMinutes <= 0) {
            toast.error("El tiempo objetivo de comida debe ser mayor a 0.");
            return;
        }

        if (
            !Number.isInteger(nextMealDelayLimitMinutes) ||
            nextMealDelayLimitMinutes < nextMealTargetMinutes
        ) {
            toast.error(
                "El límite de alerta debe ser mayor o igual al tiempo objetivo.",
            );
            return;
        }

        try {
            await onSave({
                projectId,
                mealTargetMinutes: nextMealTargetMinutes,
                mealDelayLimitMinutes: nextMealDelayLimitMinutes,
                updatedBy: profileId,
            });

            toast.success("Configuración operativa guardada.");
        } catch {
            toast.error("No se pudo guardar la configuración operativa.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white"
        >
            <div className="mb-5">
                <h3 className="text-lg font-bold">Configuración de comida</h3>

                <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                    Estos valores controlarán el flujo operativo de comida de las
                    unidades.
                </p>
            </div>

            <div className="space-y-4">
                <label className="block">
                    <span className="text-sm font-semibold text-slate-300 light:text-slate-700">
                        Tiempo objetivo de comida
                    </span>

                    <div className="mt-2 flex items-center gap-3">
                        <input
                            type="number"
                            min={1}
                            step={1}
                            value={mealTargetMinutes}
                            onChange={(event) => setMealTargetMinutes(event.target.value)}
                            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm outline-none transition focus:border-cyan-400 light:border-slate-200 light:bg-slate-50"
                        />

                        <span className="shrink-0 text-sm text-slate-400 light:text-slate-500">
                            min
                        </span>
                    </div>
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-slate-300 light:text-slate-700">
                        Límite para alerta de comida
                    </span>

                    <div className="mt-2 flex items-center gap-3">
                        <input
                            type="number"
                            min={1}
                            step={1}
                            value={mealDelayLimitMinutes}
                            onChange={(event) =>
                                setMealDelayLimitMinutes(event.target.value)
                            }
                            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm outline-none transition focus:border-cyan-400 light:border-slate-200 light:bg-slate-50"
                        />

                        <span className="shrink-0 text-sm text-slate-400 light:text-slate-500">
                            min
                        </span>
                    </div>
                </label>
            </div>

            <div className="mt-5 rounded-3xl bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200 light:bg-cyan-50 light:text-cyan-700">
                Por ahora estos valores quedan guardados en Supabase. En el siguiente
                bloque los conectamos al flujo real de comida.
            </div>

            <Button
                type="submit"
                disabled={isSaving}
                className="mt-5 w-full gap-2 rounded-2xl"
            >
                <Save size={17} />
                {isSaving ? "Guardando..." : "Guardar configuración"}
            </Button>
        </form>
    );
}

export function AdminPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { profile, can } = useAuth();

    const { settings, isLoading, isSaving, errorMessage, saveSettings } =
        useOperationalSettings(projectId);

    const canManageAdmin = can("admin.manage_catalogs");

    if (isLoading) {
        return <LoadingScreen message="Cargando administración..." />;
    }

    if (!projectId || !profile) {
        return (
            <section className="rounded-4xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 light:text-red-600">
                No se pudo identificar el proyecto o usuario.
            </section>
        );
    }

    if (!canManageAdmin) {
        return (
            <>
                <section className="mb-5">
                    <Link
                        to={`/app/projects/${projectId}`}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 light:text-cyan-700"
                    >
                        <ArrowLeft size={16} />
                        Volver al inicio
                    </Link>

                    <h2 className="text-2xl font-bold">Panel administrativo</h2>

                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        Configuración general de la operación.
                    </p>
                </section>

                <section className="rounded-4xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 light:text-red-600">
                    No tienes permiso para administrar esta operación.
                </section>
            </>
        );
    }

    return (
        <>
            <section className="mb-5">
                <Link
                    to={`/app/projects/${projectId}`}
                    className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 light:text-cyan-700"
                >
                    <ArrowLeft size={16} />
                    Volver al inicio
                </Link>

                <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                        <Settings size={24} />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold">Panel administrativo</h2>

                        <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                            Configura reglas operativas sin modificar código.
                        </p>
                    </div>
                </div>
            </section>

            {errorMessage && (
                <section className="mb-5 rounded-4xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </section>
            )}

            {settings && (
                <OperationalSettingsForm
                    key={`${settings.projectId}-${settings.updatedAt ?? "default"}`}
                    settings={settings}
                    projectId={projectId}
                    profileId={profile.id}
                    isSaving={isSaving}
                    onSave={saveSettings}
                />
            )}
        </>
    );
}