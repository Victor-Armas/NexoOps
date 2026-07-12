import { Route } from "lucide-react";
import { toast } from "sonner";
import { MovementTypeSettingForm } from "./MovementTypeSettingForm";
import { NewMovementTypeSettingForm } from "./NewMovementTypeSettingForm";
import { useMovementTypeSettingsAdmin } from "../hooks/useMovementTypeSettingsAdmin";
import type { SaveMovementTypeSettingPayload } from "../types/movement-type-settings-admin.types";

export function MovementTypeSettingsPanel() {
    const {
        movementTypeSettings,
        isLoading,
        isSaving,
        errorMessage,
        saveMovementType,
    } = useMovementTypeSettingsAdmin();

    const nextSortOrder =
        movementTypeSettings.length > 0
            ? Math.max(
                ...movementTypeSettings.map(
                    (movementType) => movementType.sortOrder,
                ),
            ) + 10
            : 10;

    const handleSave = async (values: SaveMovementTypeSettingPayload) => {
        try {
            await saveMovementType(values);
            toast.success("Tipo de movimiento guardado.");
        } catch {
            toast.error("No se pudo guardar el tipo de movimiento.");
        }
    };

    return (
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <Route size={22} />
                </div>

                <div>
                    <h3 className="text-lg font-bold">Tipos de movimiento</h3>

                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        Configura las opciones disponibles al registrar movimientos de
                        unidad.
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
                    Cargando tipos de movimiento...
                </section>
            ) : (
                <div className="space-y-3">
                    {movementTypeSettings.map((movementType) => (
                        <MovementTypeSettingForm
                            key={`${movementType.id}-${movementType.updatedAt}`}
                            movementType={movementType}
                            isSaving={isSaving}
                            onSave={handleSave}
                        />
                    ))}

                    <NewMovementTypeSettingForm
                        nextSortOrder={nextSortOrder}
                        isSaving={isSaving}
                        onSave={handleSave}
                    />
                </div>
            )}
        </section>
    );
}