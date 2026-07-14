import { ListChecks } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useUnitMovementEventActionSettingsAdmin } from "../hooks/useUnitMovementEventActionSettingsAdmin";
import type { SaveUnitMovementEventActionSettingPayload } from "../types/unit-movement-event-action-settings-admin.types";
import { NewUnitMovementEventActionSettingForm } from "./NewUnitMovementEventActionSettingForm";
import { UnitMovementEventActionSettingForm } from "./UnitMovementEventActionSettingForm";

type UnitMovementEventActionSettingsPanelProps = {
  projectId: string;
  profileId: string;
};

export function UnitMovementEventActionSettingsPanel({
  projectId,
  profileId,
}: UnitMovementEventActionSettingsPanelProps) {
  const {
    actionSettings,
    isLoading,
    isSaving,
    errorMessage,
    saveActionSetting,
  } = useUnitMovementEventActionSettingsAdmin(projectId);

  const visibleStatusSettings = useMemo(
    () =>
      actionSettings
        .filter((setting) => setting.behavior === "status")
        .sort((first, second) =>
          first.label.localeCompare(second.label, "es-MX", {
            numeric: true,
            sensitivity: "base",
          }),
        ),
    [actionSettings],
  );

  const handleSave = async (
    values: SaveUnitMovementEventActionSettingPayload,
  ) => {
    try {
      await saveActionSetting(values);
      toast.success(values.id ? "Estatus actualizado." : "Estatus creado.");
    } catch {
      toast.error("No se pudo guardar el estatus de unidad.");
    }
  };

  return (
    <section className="mt-5 rounded-sm border border-line bg-panel p-5 shadow-xl light:bg-white">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-principal/10 text-principal">
          <ListChecks size={22} />
        </div>

        <div>
          <h3 className="text-lg font-bold">Estatus de unidad</h3>
          <p className="mt-1 text-sm text-muted">
            Crea estatus operativos y define si requieren un movimiento activo.
          </p>
        </div>
      </div>

      {errorMessage && (
        <section className="mb-4 rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
      )}

      {isLoading ? (
        <section className="rounded-sm border border-line bg-surface-dark p-4 text-sm text-muted">
          Cargando estatus de unidad...
        </section>
      ) : (
        <div className="space-y-3">
          {visibleStatusSettings.map((actionSetting) => (
            <UnitMovementEventActionSettingForm
              key={`${actionSetting.id}-${actionSetting.updatedAt}`}
              actionSetting={actionSetting}
              profileId={profileId}
              isSaving={isSaving}
              onSave={handleSave}
            />
          ))}

          <NewUnitMovementEventActionSettingForm
            projectId={projectId}
            profileId={profileId}
            isSaving={isSaving}
            onSave={handleSave}
          />
        </div>
      )}
    </section>
  );
}
