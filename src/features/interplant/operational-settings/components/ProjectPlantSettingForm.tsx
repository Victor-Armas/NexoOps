import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../components/ui/Button";
import type {
    ProjectPlantSetting,
    SaveProjectPlantSettingPayload,
} from "../types/project-plant-settings-admin.types";

type ProjectPlantSettingFormProps = {
    plantSetting: ProjectPlantSetting;
    isSaving: boolean;
    onSave: (values: SaveProjectPlantSettingPayload) => Promise<void>;
};

export function ProjectPlantSettingForm({
    plantSetting,
    isSaving,
    onSave,
}: ProjectPlantSettingFormProps) {
    const [isActive, setIsActive] = useState(plantSetting.isActive);

    const handleSave = async () => {
        await onSave({
            projectId: plantSetting.projectId,
            plantId: plantSetting.plantId,
            isActive,
        });
    };

    return (
        <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs text-slate-400 light:text-slate-500">Planta</p>

                    <h4 className="text-lg font-bold">{plantSetting.code}</h4>

                    <p className="text-sm text-slate-400 light:text-slate-500">
                        {plantSetting.name}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${plantSetting.plantIsActive
                            ? "bg-emerald-400/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700"
                            : "bg-red-500/10 text-red-300 light:bg-red-50 light:text-red-600"
                        }`}
                >
                    {plantSetting.plantIsActive ? "Planta activa" : "Planta desactivada"}
                </span>
            </div>

            {plantSetting.description && (
                <p className="mb-3 text-sm text-slate-400 light:text-slate-500">
                    {plantSetting.description}
                </p>
            )}

            <div className="space-y-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-300 light:text-slate-700">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(event) => setIsActive(event.target.checked)}
                        className="h-4 w-4"
                        disabled={!plantSetting.plantIsActive}
                    />
                    Activa en este proyecto
                </label>

                {!plantSetting.plantIsActive && (
                    <p className="text-xs text-yellow-200 light:text-yellow-700">
                        Esta planta está desactivada globalmente. Aunque la actives aquí, no
                        aparecerá en operación.
                    </p>
                )}

                <Button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleSave()}
                    className="h-11 w-full gap-2 rounded-2xl"
                >
                    <Save size={16} />
                    Guardar planta
                </Button>
            </div>
        </article>
    );
}
