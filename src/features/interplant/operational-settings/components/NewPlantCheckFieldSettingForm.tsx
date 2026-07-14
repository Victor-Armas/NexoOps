import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type {
    PlantCheckFieldSettingFormValues,
    PlantCheckFieldSettingGroup,
} from "../types/plant-check-field-settings-admin.types";

type NewPlantCheckFieldSettingFormProps = {
    projectId: string;
    plantId: string;
    profileId: string;
    isSaving: boolean;
    onSave: (values: PlantCheckFieldSettingFormValues) => Promise<void>;
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

export function NewPlantCheckFieldSettingForm({
    projectId,
    plantId,
    profileId,
    isSaving,
    onSave,
}: NewPlantCheckFieldSettingFormProps) {
    const [fieldKey, setFieldKey] = useState("");
    const [label, setLabel] = useState("");
    const [fieldGroup, setFieldGroup] =
        useState<PlantCheckFieldSettingGroup>("full");

    const handleSave = async () => {
        const values: PlantCheckFieldSettingFormValues = {
            projectId,
            plantId,
            fieldKey: fieldKey.trim(),
            label: label.trim(),
            fieldGroup,
            isActive: true,
            updatedBy: profileId,
        };

        if (!validateFieldSetting(values)) {
            return;
        }

        await onSave(values);

        setFieldKey("");
        setLabel("");
        setFieldGroup("full");
    };

    return (
        <article className="rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/10 p-4 light:bg-cyan-50">
            <div className="mb-3 flex items-center gap-2 text-cyan-200 light:text-cyan-700">
                <Plus size={17} />
                <h4 className="text-sm font-bold">Agregar campo</h4>
            </div>

            <div className="space-y-3">
                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                        Clave interna
                    </span>

                    <input
                        value={fieldKey}
                        placeholder="ej. full_p7"
                        onChange={(event) =>
                            setFieldKey(event.target.value.toLowerCase().replace(/\s+/g, "_"))
                        }
                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                        Nombre visible
                    </span>

                    <input
                        value={label}
                        placeholder="Ej. Llenos para P7"
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

                <Button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleSave()}
                    className="h-11 w-full gap-2 rounded-2xl"
                >
                    <Plus size={16} />
                    Agregar campo
                </Button>
            </div>
        </article>
    );
}
