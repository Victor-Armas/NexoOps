import { Truck } from "lucide-react";
import { toast } from "sonner";
import { ProjectUnitSettingForm } from "./ProjectUnitSettingForm";
import { useProjectUnitSettingsAdmin } from "../hooks/useProjectUnitSettingsAdmin";
import type { SaveProjectUnitSettingPayload } from "../types/project-unit-settings-admin.types";

type ProjectUnitSettingsPanelProps = {
  projectId: string;
};

export function ProjectUnitSettingsPanel({
  projectId,
}: ProjectUnitSettingsPanelProps) {
  const {
    unitSettings,
    isLoading,
    isSaving,
    errorMessage,
    saveUnitSetting,
  } = useProjectUnitSettingsAdmin(projectId);

  const handleSave = async (values: SaveProjectUnitSettingPayload) => {
    try {
      await saveUnitSetting(values);
      toast.success(values.isActive ? "Unidad activada." : "Unidad desactivada.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar la unidad.",
      );
    }
  };

  const activeUnitCount = unitSettings.filter(
    (unitSetting) => unitSetting.isActive,
  ).length;

  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-principal" />
          <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Unidades
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <p className="mt-2 text-xs leading-5 text-muted">
          {unitSettings.length} registradas · {activeUnitCount} activas en este
          proyecto.
        </p>
      </div>

      {errorMessage && (
        <section className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
      )}

      {isLoading ? (
        <section className="rounded-sm border border-line bg-panel p-4 text-sm text-muted">
          Cargando unidades...
        </section>
      ) : (
        <div className="space-y-2">
          {unitSettings.map((unitSetting) => (
            <ProjectUnitSettingForm
              key={`${unitSetting.unitId}-${unitSetting.isActive}`}
              unitSetting={unitSetting}
              isSaving={isSaving}
              onSave={handleSave}
            />
          ))}
        </div>
      )}

      <p className="text-xs leading-5 text-muted">
        Antes de desactivar una unidad, valida que no tenga un movimiento abierto.
      </p>
    </section>
  );
}
