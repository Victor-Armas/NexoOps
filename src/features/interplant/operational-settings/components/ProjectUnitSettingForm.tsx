import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../components/ui/Button";
import type {
    ProjectUnitSetting,
    SaveProjectUnitSettingPayload,
} from "../types/project-unit-settings-admin.types";

type ProjectUnitSettingFormProps = {
    unitSetting: ProjectUnitSetting;
    isSaving: boolean;
    onSave: (values: SaveProjectUnitSettingPayload) => Promise<void>;
};

export function ProjectUnitSettingForm({
    unitSetting,
    isSaving,
    onSave,
}: ProjectUnitSettingFormProps) {
    const [isActive, setIsActive] = useState(unitSetting.isActive);

    const handleSave = async () => {
        await onSave({
            projectId: unitSetting.projectId,
            unitId: unitSetting.unitId,
            isActive,
        });
    };

    return (
        <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs text-slate-400 light:text-slate-500">Unidad</p>

                    <h4 className="text-lg font-bold">Unidad {unitSetting.code}</h4>

                    <p className="text-sm text-slate-400 light:text-slate-500">
                        {unitSetting.name}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${unitSetting.unitIsActive
                            ? "bg-emerald-400/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700"
                            : "bg-red-500/10 text-red-300 light:bg-red-50 light:text-red-600"
                        }`}
                >
                    {unitSetting.unitIsActive ? "Unidad activa" : "Unidad desactivada"}
                </span>
            </div>

            {unitSetting.description && (
                <p className="mb-3 text-sm text-slate-400 light:text-slate-500">
                    {unitSetting.description}
                </p>
            )}

            <div className="space-y-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-300 light:text-slate-700">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(event) => setIsActive(event.target.checked)}
                        className="h-4 w-4"
                        disabled={!unitSetting.unitIsActive}
                    />
                    Activa en este proyecto
                </label>

                {!unitSetting.unitIsActive && (
                    <p className="text-xs text-yellow-200 light:text-yellow-700">
                        Esta unidad está desactivada globalmente. Aunque la actives aquí, no
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
                    Guardar unidad
                </Button>
            </div>
        </article>
    );
}
