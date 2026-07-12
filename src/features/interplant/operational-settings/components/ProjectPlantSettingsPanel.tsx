import { Factory } from "lucide-react";
import { toast } from "sonner";
import { ProjectPlantSettingForm } from "./ProjectPlantSettingForm";
import { useProjectPlantSettingsAdmin } from "../hooks/useProjectPlantSettingsAdmin";
import type { SaveProjectPlantSettingPayload } from "../types/project-plant-settings-admin.types";

type ProjectPlantSettingsPanelProps = {
    projectId: string;
};

export function ProjectPlantSettingsPanel({
    projectId,
}: ProjectPlantSettingsPanelProps) {
    const {
        plantSettings,
        isLoading,
        isSaving,
        errorMessage,
        savePlantSetting,
    } = useProjectPlantSettingsAdmin(projectId);

    const handleSave = async (values: SaveProjectPlantSettingPayload) => {
        try {
            await savePlantSetting(values);
            toast.success("Planta guardada.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "No se pudo guardar la planta.",
            );
        }
    };

    return (
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <Factory size={22} />
                </div>

                <div>
                    <h3 className="text-lg font-bold">Plantas del proyecto</h3>

                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        Configura qué plantas aparecen en la operación y el orden en que se
                        muestran.
                    </p>
                </div>
            </div>

            <section className="mb-4 rounded-3xl bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100 light:bg-yellow-50 light:text-yellow-700">
                Antes de desactivar una planta, valida que no sea origen o destino de un
                movimiento abierto.
            </section>

            {errorMessage && (
                <section className="mb-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </section>
            )}

            {isLoading ? (
                <section className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400 light:border-slate-200 light:bg-slate-50 light:text-slate-500">
                    Cargando plantas...
                </section>
            ) : (
                <div className="space-y-3">
                    {plantSettings.map((plantSetting) => (
                        <ProjectPlantSettingForm
                            key={`${plantSetting.plantId}-${plantSetting.sortOrder}-${plantSetting.isActive}`}
                            plantSetting={plantSetting}
                            isSaving={isSaving}
                            onSave={handleSave}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}