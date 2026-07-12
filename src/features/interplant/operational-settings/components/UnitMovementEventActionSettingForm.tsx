import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type {
    SaveUnitMovementEventActionSettingPayload,
    UnitMovementEventActionSetting,
} from "../types/unit-movement-event-action-settings-admin.types";

type UnitMovementEventActionSettingFormProps = {
    actionSetting: UnitMovementEventActionSetting;
    profileId: string;
    isSaving: boolean;
    onSave: (
        values: SaveUnitMovementEventActionSettingPayload,
    ) => Promise<void>;
};

export function UnitMovementEventActionSettingForm({
    actionSetting,
    profileId,
    isSaving,
    onSave,
}: UnitMovementEventActionSettingFormProps) {
    const [label, setLabel] = useState(actionSetting.label);
    const [sortOrder, setSortOrder] = useState(String(actionSetting.sortOrder));
    const [isActive, setIsActive] = useState(actionSetting.isActive);

    const handleSave = async () => {
        const nextSortOrder = Number(sortOrder);

        if (label.trim().length === 0) {
            toast.error("El nombre del botón es requerido.");
            return;
        }

        if (!Number.isInteger(nextSortOrder) || nextSortOrder < 0) {
            toast.error("El orden debe ser un número entero mayor o igual a 0.");
            return;
        }

        await onSave({
            projectId: actionSetting.projectId,
            eventType: actionSetting.eventType,
            label: label.trim(),
            sortOrder: nextSortOrder,
            isActive,
            updatedBy: profileId,
        });
    };

    return (
        <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
            <div className="mb-3">
                <p className="text-xs text-slate-400 light:text-slate-500">
                    Tipo de evento
                </p>

                <p className="font-mono text-sm text-cyan-200 light:text-cyan-700">
                    {actionSetting.eventType}
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
                        Orden
                    </span>

                    <input
                        type="number"
                        min={0}
                        step={1}
                        value={sortOrder}
                        onChange={(event) => setSortOrder(event.target.value)}
                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
                    />
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

                <Button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleSave()}
                    className="h-11 w-full gap-2 rounded-2xl"
                >
                    <Save size={16} />
                    Guardar botón
                </Button>
            </div>
        </article>
    );
}