import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type {
    PlantCheckFieldSetting,
    PlantCheckFieldSettingFormValues,
    PlantCheckFieldSettingGroup,
} from "../types/plant-check-field-settings-admin.types";

type PlantCheckFieldSettingFormProps = {
    fieldSetting: PlantCheckFieldSetting;
    profileId: string;
    isSaving: boolean;
    onSave: (values: PlantCheckFieldSettingFormValues) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
};

const FIELD_KEY_PATTERN = /^[a-z0-9_]+$/;

const FIELD_GROUP_LABELS: Record<PlantCheckFieldSettingGroup, string> = {
    full: "Llenos",
    empty: "Vacíos",
};

function validateFieldSetting(values: PlantCheckFieldSettingFormValues) {
    if (!FIELD_KEY_PATTERN.test(values.fieldKey)) {
        toast.error("La clave solo puede usar minúsculas, números y guion bajo.");
        return false;
    }

    if (values.label.trim().length === 0) {
        toast.error("El nombre del campo es requerido.");
        return false;
    }

    return true;
}

export function PlantCheckFieldSettingForm({
    fieldSetting,
    profileId,
    isSaving,
    onSave,
    onDelete,
}: PlantCheckFieldSettingFormProps) {
    const [label, setLabel] = useState(fieldSetting.label);
    const [fieldGroup, setFieldGroup] = useState(fieldSetting.fieldGroup);
    const [isActive, setIsActive] = useState(fieldSetting.isActive);

    const handleSave = async () => {
        const values: PlantCheckFieldSettingFormValues = {
            id: fieldSetting.id,
            projectId: fieldSetting.projectId,
            plantId: fieldSetting.plantId,
            fieldKey: fieldSetting.fieldKey,
            label: label.trim(),
            fieldGroup,
            isActive,
            updatedBy: profileId,
        };

        if (!validateFieldSetting(values)) {
            return;
        }

        await onSave(values);
    };

    const handleDelete = async () => {
        const shouldDelete = window.confirm(
            `¿Eliminar el campo "${fieldSetting.label}"?`,
        );

        if (!shouldDelete) {
            return;
        }

        await onDelete(fieldSetting.id);
    };

    return (
        <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
            <div className="mb-3">
                <p className="text-xs text-slate-400 light:text-slate-500">Clave</p>

                <p className="font-mono text-sm text-cyan-200 light:text-cyan-700">
                    {fieldSetting.fieldKey}
                </p>
            </div>

            <div className="space-y-3">
                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                        Nombre visible
                    </span>

                    <input
                        value={label}
                        onChange={(event) => setLabel(event.target.value)}
                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                        Grupo
                    </span>

                    <select
                        value={fieldGroup}
                        onChange={(event) =>
                            setFieldGroup(event.target.value as PlantCheckFieldSettingGroup)
                        }
                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
                    >
                        {Object.entries(FIELD_GROUP_LABELS).map(([value, text]) => (
                            <option key={value} value={value} className="text-slate-950">
                                {text}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-slate-300 light:text-slate-700">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(event) => setIsActive(event.target.checked)}
                        className="h-4 w-4"
                    />
                    Activo
                </label>

                <div className="grid grid-cols-[1fr_auto] gap-3">
                    <Button
                        type="button"
                        disabled={isSaving}
                        onClick={() => void handleSave()}
                        className="h-11 gap-2 rounded-2xl"
                    >
                        <Save size={16} />
                        Guardar
                    </Button>

                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => void handleDelete()}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 disabled:opacity-50 light:text-red-600"
                        aria-label="Eliminar campo"
                        title="Eliminar campo"
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            </div>
        </article>
    );
}
