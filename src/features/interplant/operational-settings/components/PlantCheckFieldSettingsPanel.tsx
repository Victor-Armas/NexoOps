import { useMemo } from "react";
import { ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { usePlants } from "../../plants/hooks/usePlants";
import { NewPlantCheckFieldSettingForm } from "./NewPlantCheckFieldSettingForm";
import { PlantCheckFieldSettingForm } from "./PlantCheckFieldSettingForm";
import { usePlantCheckFieldSettingsAdmin } from "../hooks/usePlantCheckFieldSettingsAdmin";
import type {
    PlantCheckFieldSetting,
    PlantCheckFieldSettingFormValues,
} from "../types/plant-check-field-settings-admin.types";

type PlantCheckFieldSettingsPanelProps = {
    projectId: string;
    profileId: string;
};

function compareFieldSettings(
    first: PlantCheckFieldSetting,
    second: PlantCheckFieldSetting,
) {
    const groupComparison = first.fieldGroup.localeCompare(second.fieldGroup);

    if (groupComparison !== 0) {
        return groupComparison;
    }

    return first.label.localeCompare(second.label, "es-MX", {
        numeric: true,
        sensitivity: "base",
    });
}

export function PlantCheckFieldSettingsPanel({
    projectId,
    profileId,
}: PlantCheckFieldSettingsPanelProps) {
    const {
        plants,
        isLoading: isLoadingPlants,
        errorMessage: plantsErrorMessage,
    } = usePlants(projectId);

    const {
        fieldSettings,
        isLoading: isLoadingFieldSettings,
        isSaving,
        errorMessage: fieldSettingsErrorMessage,
        saveFieldSetting,
        removeFieldSetting,
    } = usePlantCheckFieldSettingsAdmin(projectId);

    const fieldSettingsByPlantId = useMemo(() => {
        return fieldSettings.reduce<Record<string, PlantCheckFieldSetting[]>>(
            (groups, fieldSetting) => {
                const currentGroup = groups[fieldSetting.plantId] ?? [];

                return {
                    ...groups,
                    [fieldSetting.plantId]: [...currentGroup, fieldSetting].sort(
                        compareFieldSettings,
                    ),
                };
            },
            {},
        );
    }, [fieldSettings]);

    const errorMessage = plantsErrorMessage || fieldSettingsErrorMessage;
    const isLoading = isLoadingPlants || isLoadingFieldSettings;

    const handleSave = async (values: PlantCheckFieldSettingFormValues) => {
        try {
            await saveFieldSetting(values);
            toast.success("Campo de revisión guardado.");
        } catch {
            toast.error("No se pudo guardar el campo de revisión.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await removeFieldSetting(id);
            toast.success("Campo de revisión eliminado.");
        } catch {
            toast.error("No se pudo eliminar el campo de revisión.");
        }
    };

    return (
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <ClipboardCheck size={22} />
                </div>

                <div>
                    <h3 className="text-lg font-bold">Campos de revisión por planta</h3>

                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        Configura qué campos aparecen al capturar el estatus operativo de
                        cada planta.
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
                    Cargando campos de revisión...
                </section>
            ) : (
                <div className="space-y-5">
                    {plants.map((plant) => {
                        const plantFieldSettings = fieldSettingsByPlantId[plant.id] ?? [];

                        return (
                            <section
                                key={plant.id}
                                className="rounded-4xl border border-white/10 bg-slate-950/20 p-4 light:border-slate-200 light:bg-slate-50"
                            >
                                <div className="mb-4">
                                    <h4 className="font-bold">{plant.name}</h4>

                                    <p className="text-xs text-slate-400 light:text-slate-500">
                                        {plant.code}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {plantFieldSettings.map((fieldSetting) => (
                                        <PlantCheckFieldSettingForm
                                            key={`${fieldSetting.id}-${fieldSetting.updatedAt}`}
                                            fieldSetting={fieldSetting}
                                            profileId={profileId}
                                            isSaving={isSaving}
                                            onSave={handleSave}
                                            onDelete={handleDelete}
                                        />
                                    ))}

                                    <NewPlantCheckFieldSettingForm
                                        projectId={projectId}
                                        plantId={plant.id}
                                        profileId={profileId}
                                        isSaving={isSaving}
                                        onSave={handleSave}
                                    />
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
