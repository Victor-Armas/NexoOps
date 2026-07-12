import { useMemo } from "react";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";
import type { UnitMovementEventType } from "../../unit-movement-events/types/unit-movement-event.types";
import { UnitMovementEventActionSettingForm } from "./UnitMovementEventActionSettingForm";
import { useUnitMovementEventActionSettingsAdmin } from "../hooks/useUnitMovementEventActionSettingsAdmin";
import type {
    SaveUnitMovementEventActionSettingPayload,
    UnitMovementEventActionSetting,
} from "../types/unit-movement-event-action-settings-admin.types";

type UnitMovementEventActionSettingsPanelProps = {
    projectId: string;
    profileId: string;
};

type DefaultUnitMovementEventActionSetting = {
    eventType: UnitMovementEventType;
    label: string;
    sortOrder: number;
};

const DEFAULT_ACTION_SETTINGS: DefaultUnitMovementEventActionSetting[] = [
    {
        eventType: "in_transit",
        label: "En camino",
        sortOrder: 10,
    },
    {
        eventType: "waiting_dock",
        label: "Esperando rampa",
        sortOrder: 20,
    },
    {
        eventType: "positioned",
        label: "En rampa",
        sortOrder: 30,
    },
    {
        eventType: "loading",
        label: "Cargando",
        sortOrder: 40,
    },
    {
        eventType: "unloading",
        label: "Descargando",
        sortOrder: 50,
    },
    {
        eventType: "released",
        label: "Saliendo de planta",
        sortOrder: 60,
    },
    {
        eventType: "driver_change",
        label: "Cambio operador",
        sortOrder: 70,
    },
];

function mergeActionSettings(params: {
    projectId: string;
    actionSettings: UnitMovementEventActionSetting[];
}) {
    return DEFAULT_ACTION_SETTINGS.map((defaultActionSetting) => {
        const savedActionSetting = params.actionSettings.find(
            (actionSetting) =>
                actionSetting.eventType === defaultActionSetting.eventType,
        );

        if (savedActionSetting) {
            return savedActionSetting;
        }

        return {
            id: null,
            projectId: params.projectId,
            eventType: defaultActionSetting.eventType,
            label: defaultActionSetting.label,
            sortOrder: defaultActionSetting.sortOrder,
            isActive: true,
            updatedBy: null,
            createdAt: null,
            updatedAt: null,
        };
    }).sort((first, second) => first.sortOrder - second.sortOrder);
}

export function UnitMovementEventActionSettingsPanel({
    projectId,
    profileId,
}: UnitMovementEventActionSettingsPanelProps) {
    const {
        actionSettings,
        isLoading,
        isSaving,
        errorMessage,
        saveActionSetting,
    } = useUnitMovementEventActionSettingsAdmin(projectId);

    const mergedActionSettings = useMemo(
        () =>
            mergeActionSettings({
                projectId,
                actionSettings,
            }),
        [projectId, actionSettings],
    );

    const handleSave = async (
        values: SaveUnitMovementEventActionSettingPayload,
    ) => {
        try {
            await saveActionSetting(values);
            toast.success("Botón de estado guardado.");
        } catch {
            toast.error("No se pudo guardar el botón de estado.");
        }
    };

    return (
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <ListChecks size={22} />
                </div>

                <div>
                    <h3 className="text-lg font-bold">Botones de estado de unidad</h3>

                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        Configura los botones que aparecen al actualizar el estado de un
                        movimiento abierto.
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
                    Cargando botones de estado...
                </section>
            ) : (
                <div className="space-y-3">
                    {mergedActionSettings.map((actionSetting) => (
                        <UnitMovementEventActionSettingForm
                            key={`${actionSetting.eventType}-${actionSetting.updatedAt ?? "default"}`}
                            actionSetting={actionSetting}
                            profileId={profileId}
                            isSaving={isSaving}
                            onSave={handleSave}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}