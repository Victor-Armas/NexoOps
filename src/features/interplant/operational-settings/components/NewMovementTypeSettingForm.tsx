import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type { SaveMovementTypeSettingPayload } from "../types/movement-type-settings-admin.types";

type NewMovementTypeSettingFormProps = {
    nextSortOrder: number;
    isSaving: boolean;
    onSave: (values: SaveMovementTypeSettingPayload) => Promise<void>;
};

const CODE_PATTERN = /^[a-z0-9_]+$/;

export function NewMovementTypeSettingForm({
    nextSortOrder,
    isSaving,
    onSave,
}: NewMovementTypeSettingFormProps) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sortOrder, setSortOrder] = useState(String(nextSortOrder));

    const handleSave = async () => {
        const nextCode = code.trim();
        const nextSortOrderValue = Number(sortOrder);

        if (!CODE_PATTERN.test(nextCode)) {
            toast.error("El código solo puede usar minúsculas, números y guion bajo.");
            return;
        }

        if (name.trim().length === 0) {
            toast.error("El nombre del tipo de movimiento es requerido.");
            return;
        }

        if (
            !Number.isInteger(nextSortOrderValue) ||
            nextSortOrderValue < 0
        ) {
            toast.error("El orden debe ser un número entero mayor o igual a 0.");
            return;
        }

        await onSave({
            code: nextCode,
            name: name.trim(),
            description: description.trim() || null,
            sortOrder: nextSortOrderValue,
            isActive: true,
        });

        setCode("");
        setName("");
        setDescription("");
        setSortOrder(String(nextSortOrder + 10));
    };

    return (
        <article className="rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/10 p-4 light:bg-cyan-50">
            <div className="mb-3 flex items-center gap-2 text-cyan-200 light:text-cyan-700">
                <Plus size={17} />
                <h4 className="text-sm font-bold">Agregar tipo de movimiento</h4>
            </div>

            <div className="space-y-3">
                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                        Código
                    </span>

                    <input
                        value={code}
                        placeholder="ej. special"
                        onChange={(event) =>
                            setCode(event.target.value.toLowerCase().replace(/\s+/g, "_"))
                        }
                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                        Nombre visible
                    </span>

                    <input
                        value={name}
                        placeholder="Ej. Material especial"
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
                        placeholder="Opcional"
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

                <Button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleSave()}
                    className="h-11 w-full gap-2 rounded-2xl"
                >
                    <Plus size={16} />
                    Agregar tipo
                </Button>
            </div>
        </article>
    );
}