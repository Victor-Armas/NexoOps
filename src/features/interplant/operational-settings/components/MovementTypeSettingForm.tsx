import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type {
    MovementTypeSetting,
    SaveMovementTypeSettingPayload,
} from "../types/movement-type-settings-admin.types";

type MovementTypeSettingFormProps = {
    movementType: MovementTypeSetting;
    isSaving: boolean;
    onSave: (values: SaveMovementTypeSettingPayload) => Promise<void>;
};

const CODE_PATTERN = /^[a-z0-9_]+$/;

export function MovementTypeSettingForm({
    movementType,
    isSaving,
    onSave,
}: MovementTypeSettingFormProps) {
    const [name, setName] = useState(movementType.name);
    const [description, setDescription] = useState(
        movementType.description ?? "",
    );
    const [sortOrder, setSortOrder] = useState(String(movementType.sortOrder));
    const [isActive, setIsActive] = useState(movementType.isActive);

    const handleSave = async () => {
        const nextSortOrder = Number(sortOrder);

        if (!CODE_PATTERN.test(movementType.code)) {
            toast.error("El código solo puede usar minúsculas, números y guion bajo.");
            return;
        }

        if (name.trim().length === 0) {
            toast.error("El nombre del tipo de movimiento es requerido.");
            return;
        }

        if (!Number.isInteger(nextSortOrder) || nextSortOrder < 0) {
            toast.error("El orden debe ser un número entero mayor o igual a 0.");
            return;
        }

        await onSave({
            id: movementType.id,
            code: movementType.code,
            name: name.trim(),
            description: description.trim() || null,
            sortOrder: nextSortOrder,
            isActive,
        });
    };

    return (
        <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
            <div className="mb-3">
                <p className="text-xs text-slate-400 light:text-slate-500">Código</p>

                <p className="font-mono text-sm text-cyan-200 light:text-cyan-700">
                    {movementType.code}
                </p>
            </div>

            <div className="space-y-3">
                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                        Nombre visible
                    </span>

                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                        Descripción
                    </span>

                    <input
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
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
                    Guardar tipo
                </Button>
            </div>
        </article>
    );
}