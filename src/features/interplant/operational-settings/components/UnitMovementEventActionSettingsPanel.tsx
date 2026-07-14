import { useMemo } from "react";
import { ListChecks } from "lucide-react";
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
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ListChecks size={14} className="text-principal" />
        <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Botones de estatus
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
          Cargando estatus de unidad...
        </section>
      ) : (
        <div className="space-y-2">
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
