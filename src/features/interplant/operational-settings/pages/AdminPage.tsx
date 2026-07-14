import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import {
    Link,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { Button } from "../../../../components/ui/Button";
import { useAuth } from "../../../auth/hooks/useAuth";
import { AdminTabs } from "../components/AdminTabs";
import type { AdminTab } from "../components/AdminTabs";
import { MovementTypeSettingsPanel } from "../components/MovementTypeSettingsPanel";
import { PlantCheckFieldSettingsPanel } from "../components/PlantCheckFieldSettingsPanel";
import { ProjectPlantSettingsPanel } from "../components/ProjectPlantSettingsPanel";
import { ProjectUnitSettingsPanel } from "../components/ProjectUnitSettingsPanel";
import { RolePermissionsPanel } from "../components/RolePermissionsPanel";
import { UnitMovementEventActionSettingsPanel } from "../components/UnitMovementEventActionSettingsPanel";
import { UserSettingsPanel } from "../components/UserSettingsPanel";
import { useOperationalSettings } from "../hooks/useOperationalSettings";
import type { OperationalSettings } from "../types/operational-settings.types";

const ADMIN_TAB_VALUES: AdminTab[] = [
    "operacion",
    "plantas",
    "unidades",
    "movimientos",
    "usuarios",
    "permisos",
];

function isAdminTab(value: string | null): value is AdminTab {
    return value !== null && ADMIN_TAB_VALUES.includes(value as AdminTab);
}

type OperationalSettingsFormProps = {
    settings: OperationalSettings;
    projectId: string;
    profileId: string;
    isSaving: boolean;
    onSave: ReturnType<typeof useOperationalSettings>["saveSettings"];
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

    const [mediumFullCountThreshold, setMediumFullCountThreshold] = useState(
        String(settings.mediumFullCountThreshold),
    );

    const [mediumEmptyCountThreshold, setMediumEmptyCountThreshold] = useState(
        String(settings.mediumEmptyCountThreshold),
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextMealTargetMinutes = Number(mealTargetMinutes);
        const nextMealDelayLimitMinutes = Number(mealDelayLimitMinutes);
        const nextMediumFullCountThreshold = Number(mediumFullCountThreshold);
        const nextMediumEmptyCountThreshold = Number(mediumEmptyCountThreshold);

        if (
            !Number.isInteger(nextMealTargetMinutes) ||
            nextMealTargetMinutes <= 0
        ) {
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

        if (
            !Number.isInteger(nextMediumFullCountThreshold) ||
            nextMediumFullCountThreshold < 0
        ) {
            toast.error("El umbral de llenos debe ser mayor o igual a 0.");
            return;
        }

        if (
            !Number.isInteger(nextMediumEmptyCountThreshold) ||
            nextMediumEmptyCountThreshold < 0
        ) {
            toast.error("El umbral de vacíos debe ser mayor o igual a 0.");
            return;
        }

        try {
            await onSave({
                projectId,
                mealTargetMinutes: nextMealTargetMinutes,
                mealDelayLimitMinutes: nextMealDelayLimitMinutes,
                mediumFullCountThreshold: nextMediumFullCountThreshold,
                mediumEmptyCountThreshold: nextMediumEmptyCountThreshold,
                updatedBy: profileId,
            });

            toast.success("Configuración operativa guardada.");
        } catch {
            toast.error("No se pudo guardar la configuración operativa.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section>
                <div className="mb-3 flex items-center gap-2">
                    <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                        Comida
                    </span>

                    <div className="h-px flex-1 bg-line" />
                </div>

                <div className="overflow-hidden rounded-sm border border-line bg-panel">
                    <label className="flex min-h-14 items-center justify-between gap-4 border-b border-line px-4 py-3">
                        <span className="text-sm font-medium text-foreground">
                            Tiempo objetivo
                        </span>

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                step={1}
                                inputMode="numeric"
                                value={mealTargetMinutes}
                                onChange={(event) =>
                                    setMealTargetMinutes(event.target.value)
                                }
                                className="w-16 bg-transparent text-right font-ibm-plex-mono text-sm font-semibold text-foreground outline-none"
                            />

                            <span className="font-ibm-plex-mono text-xs text-muted">
                                min
                            </span>
                        </div>
                    </label>

                    <label className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
                        <span className="text-sm font-medium text-foreground">
                            Límite de alerta
                        </span>

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                step={1}
                                inputMode="numeric"
                                value={mealDelayLimitMinutes}
                                onChange={(event) =>
                                    setMealDelayLimitMinutes(event.target.value)
                                }
                                className="w-16 bg-transparent text-right font-ibm-plex-mono text-sm font-semibold text-foreground outline-none"
                            />

                            <span className="font-ibm-plex-mono text-xs text-muted">
                                min
                            </span>
                        </div>
                    </label>
                </div>
            </section>

            <section>
                <div className="mb-3 flex items-center gap-2">
                    <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                        Riesgo operativo
                    </span>

                    <div className="h-px flex-1 bg-line" />
                </div>

                <div className="overflow-hidden rounded-sm border border-line bg-panel">
                    <label className="flex min-h-14 items-center justify-between gap-4 border-b border-line px-4 py-3">
                        <span className="text-sm font-medium text-foreground">
                            Riesgo medio si llenos ≥
                        </span>

                        <input
                            type="number"
                            min={0}
                            step={1}
                            inputMode="numeric"
                            value={mediumFullCountThreshold}
                            onChange={(event) =>
                                setMediumFullCountThreshold(event.target.value)
                            }
                            className="w-16 bg-transparent text-right font-ibm-plex-mono text-sm font-semibold text-foreground outline-none"
                        />
                    </label>

                    <label className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
                        <span className="text-sm font-medium text-foreground">
                            Riesgo medio si vacíos ≥
                        </span>

                        <input
                            type="number"
                            min={0}
                            step={1}
                            inputMode="numeric"
                            value={mediumEmptyCountThreshold}
                            onChange={(event) =>
                                setMediumEmptyCountThreshold(event.target.value)
                            }
                            className="w-16 bg-transparent text-right font-ibm-plex-mono text-sm font-semibold text-foreground outline-none"
                        />
                    </label>
                </div>

                <p className="mt-3 text-xs leading-5 text-muted">
                    “Sin espacio” y “Sin rampa” siempre marcan riesgo alto
                    automáticamente, sin importar estos valores.
                </p>
            </section>

            <Button
                type="submit"
                disabled={isSaving}
                className="h-12 w-full gap-2 rounded-sm bg-principal font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] text-black hover:bg-principal/90"
            >
                <Save size={17} />

                {isSaving ? "Guardando..." : "Guardar configuración"}
            </Button>
        </form>
    );
}

export function AdminPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { profile, can } = useAuth();

    const {
        settings,
        isLoading,
        isSaving,
        errorMessage,
        saveSettings,
    } = useOperationalSettings(projectId);

    const canManageAdmin = can("admin.manage_catalogs");
    const canManagePermissions = can("admin.manage_permissions");

    const requestedTab = searchParams.get("tab");

    const activeTab: AdminTab =
        isAdminTab(requestedTab) &&
            (canManagePermissions ||
                (requestedTab !== "usuarios" &&
                    requestedTab !== "permisos"))
            ? requestedTab
            : "operacion";

    const handleTabChange = (tab: AdminTab) => {
        const nextParams = new URLSearchParams(searchParams);

        nextParams.set("tab", tab);

        setSearchParams(nextParams, {
            replace: true,
        });
    };

    if (isLoading) {
        return (
            <LoadingScreen message="Cargando administración..." />
        );
    }

    if (!projectId || !profile) {
        return (
            <section className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                No se pudo identificar el proyecto o usuario.
            </section>
        );
    }

    if (!canManageAdmin) {
        return (
            <div className="space-y-5">
                <header>
                    <Link
                        to={`/app/projects/${projectId}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted transition hover:text-principal"
                    >
                        <ArrowLeft size={15} />
                        Volver a operación
                    </Link>

                    <p className="mt-5 font-ibm-plex-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        Administración
                    </p>

                    <h1 className="mt-1 font-barlow-condensed text-3xl font-bold">
                        Configuración
                    </h1>
                </header>

                <section className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                    No tienes permiso para administrar esta operación.
                </section>
            </div>
        );
    }

    return (
        <div>
            <header className="mb-5">
                <Link
                    to={`/app/projects/${projectId}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted transition hover:text-principal"
                >
                    <ArrowLeft size={15} />
                    Volver a operación
                </Link>

                <p className="mt-5 font-ibm-plex-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    Administración
                </p>

                <h1 className="mt-1 font-barlow-condensed text-3xl font-bold">
                    Configuración
                </h1>

                <div className="mt-5">
                    <AdminTabs
                        activeTab={activeTab}
                        canManagePermissions={canManagePermissions}
                        onChange={handleTabChange}
                    />
                </div>
            </header>

            {errorMessage && (
                <section className="mb-5 rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                    {errorMessage}
                </section>
            )}

            <main>
                {activeTab === "operacion" && settings && (
                    <OperationalSettingsForm
                        key={`${settings.projectId}-${settings.updatedAt ?? "default"}`}
                        settings={settings}
                        projectId={projectId}
                        profileId={profile.id}
                        isSaving={isSaving}
                        onSave={saveSettings}
                    />
                )}

                {activeTab === "plantas" && (
                    <div className="space-y-4">
                        <ProjectPlantSettingsPanel projectId={projectId} />

                        <PlantCheckFieldSettingsPanel
                            projectId={projectId}
                            profileId={profile.id}
                        />
                    </div>
                )}

                {activeTab === "unidades" && (
                    <ProjectUnitSettingsPanel projectId={projectId} />
                )}

                {activeTab === "movimientos" && (
                    <div className="space-y-4">
                        <MovementTypeSettingsPanel />

                        <UnitMovementEventActionSettingsPanel
                            projectId={projectId}
                            profileId={profile.id}
                        />
                    </div>
                )}

                {activeTab === "usuarios" &&
                    canManagePermissions && (
                        <UserSettingsPanel
                            currentUserId={profile.id}
                        />
                    )}

                {activeTab === "permisos" &&
                    canManagePermissions && (
                        <RolePermissionsPanel />
                    )}
            </main>
        </div>
    );
}