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
          ...movementTypeSettings.map((movementType) => movementType.sortOrder),
        ) + 10
      : 10;

  const handleSave = async (values: SaveMovementTypeSettingPayload) => {
    try {
      await saveMovementType(values);
      toast.success(values.id ? "Tipo actualizado." : "Tipo creado.");
    } catch {
      toast.error("No se pudo guardar el tipo de movimiento.");
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Route size={14} className="text-principal" />
        <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Tipos de movimiento
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {errorMessage && (
        <section className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
      )}

      {isLoading ? (
        <section className="rounded-sm border border-line bg-panel p-4 text-sm text-muted">
          Cargando tipos de movimiento...
        </section>
      ) : (
        <div className="space-y-2">
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
