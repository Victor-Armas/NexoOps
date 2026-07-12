import { Truck } from "lucide-react";
import { toast } from "sonner";
import { ProjectUnitSettingForm } from "./ProjectUnitSettingForm";
import { useProjectUnitSettingsAdmin } from "../hooks/useProjectUnitSettingsAdmin";
import type { SaveProjectUnitSettingPayload } from "../types/project-unit-settings-admin.types";

type ProjectUnitSettingsPanelProps = {
    projectId: string;
};

export function ProjectUnitSettingsPanel({
    projectId,
}: ProjectUnitSettingsPanelProps) {
    const {
        unitSettings,
        isLoading,
        isSaving,
        errorMessage,
        saveUnitSetting,
    } = useProjectUnitSettingsAdmin(projectId);

    const handleSave = async (values: SaveProjectUnitSettingPayload) => {
        try {
            await saveUnitSetting(values);
            toast.success("Unidad guardada.");
        } catch {
            toast.error("No se pudo guardar la unidad.");
        }
    };

    return (
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <Truck size={22} />
                </div>

                <div>
                    <h3 className="text-lg font-bold">Unidades del proyecto</h3>

                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        Configura qué unidades aparecen en la operación y el orden en que se
                        muestran.
                    </p>
                </div>
            </div>

            <section className="mb-4 rounded-3xl bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100 light:bg-yellow-50 light:text-yellow-700">
                Antes de desactivar una unidad, valida que no tenga un movimiento
                abierto.
            </section>

            {errorMessage && (
                <section className="mb-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </section>
            )}

            {isLoading ? (
                <section className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400 light:border-slate-200 light:bg-slate-50 light:text-slate-500">
                    Cargando unidades...
                </section>
            ) : (
                <div className="space-y-3">
                    {unitSettings.map((unitSetting) => (
                        <ProjectUnitSettingForm
                            key={`${unitSetting.unitId}-${unitSetting.sortOrder}-${unitSetting.isActive}`}
                            unitSetting={unitSetting}
                            isSaving={isSaving}
                            onSave={handleSave}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}