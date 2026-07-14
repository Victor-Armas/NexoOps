import { useMemo, useState } from "react";
import { Factory } from "lucide-react";
import { toast } from "sonner";
import { NewPlantCheckFieldSettingForm } from "./NewPlantCheckFieldSettingForm";
import { PlantCheckFieldSettingForm } from "./PlantCheckFieldSettingForm";
import { ProjectPlantSettingForm } from "./ProjectPlantSettingForm";
import { usePlantCheckFieldSettingsAdmin } from "../hooks/usePlantCheckFieldSettingsAdmin";
import { useProjectPlantSettingsAdmin } from "../hooks/useProjectPlantSettingsAdmin";
import type {
  PlantCheckFieldSetting,
  PlantCheckFieldSettingFormValues,
} from "../types/plant-check-field-settings-admin.types";
import type { SaveProjectPlantSettingPayload } from "../types/project-plant-settings-admin.types";

type ProjectPlantSettingsPanelProps = {
  projectId: string;
  profileId: string;
};

function compareFieldSettings(
  first: PlantCheckFieldSetting,
  second: PlantCheckFieldSetting,
) {
  const groupComparison = first.fieldGroup.localeCompare(second.fieldGroup);

  if (groupComparison !== 0) {
    return groupComparison;
  }

  return first.label.localeCompare(second.label, "es-MX", {
    numeric: true,
    sensitivity: "base",
  });
}

export function ProjectPlantSettingsPanel({
  projectId,
  profileId,
}: ProjectPlantSettingsPanelProps) {
  const [openPlantId, setOpenPlantId] = useState<
    string | null | undefined
  >(undefined);

  const {
    plantSettings,
    isLoading: isLoadingPlants,
    isSaving: isSavingPlant,
    errorMessage: plantErrorMessage,
    savePlantSetting,
  } = useProjectPlantSettingsAdmin(projectId);

  const {
    fieldSettings,
    isLoading: isLoadingFields,
    isSaving: isSavingField,
    errorMessage: fieldErrorMessage,
    saveFieldSetting,
    removeFieldSetting,
  } = usePlantCheckFieldSettingsAdmin(projectId);





  const fieldSettingsByPlantId = useMemo(
    () =>
      fieldSettings.reduce<Record<string, PlantCheckFieldSetting[]>>(
        (groups, fieldSetting) => {
          const currentGroup = groups[fieldSetting.plantId] ?? [];

          return {
            ...groups,
            [fieldSetting.plantId]: [...currentGroup, fieldSetting].sort(
              compareFieldSettings,
            ),
          };
        },
        {},
      ),
    [fieldSettings],
  );

  const defaultOpenPlantId =
    plantSettings.find((plantSetting) => plantSetting.isActive)?.plantId ??
    plantSettings[0]?.plantId ??
    null;

  const resolvedOpenPlantId =
    openPlantId === undefined ? defaultOpenPlantId : openPlantId;

  const handlePlantSave = async (values: SaveProjectPlantSettingPayload) => {
    try {
      await savePlantSetting(values);
      toast.success(values.isActive ? "Planta activada." : "Planta desactivada.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar la planta.",
      );
    }
  };

  const handleFieldSave = async (values: PlantCheckFieldSettingFormValues) => {
    try {
      await saveFieldSetting(values);
      toast.success(values.id ? "Campo actualizado." : "Campo creado.");
    } catch {
      toast.error("No se pudo guardar el campo de revisión.");
    }
  };

  const handleFieldDelete = async (id: string) => {
    try {
      await removeFieldSetting(id);
      toast.success("Campo eliminado.");
    } catch {
      toast.error("No se pudo eliminar el campo de revisión.");
    }
  };

  const errorMessage = plantErrorMessage || fieldErrorMessage;
  const isLoading = isLoadingPlants || isLoadingFields;
  const isSaving = isSavingPlant || isSavingField;
  const activePlantCount = plantSettings.filter(
    (plantSetting) => plantSetting.isActive,
  ).length;



  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Factory size={14} className="text-principal" />
          <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Plantas
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <p className="mt-2 text-xs leading-5 text-muted">
          {plantSettings.length} registradas · {activePlantCount} activas. Define
          sus campos de revisión desde cada acordeón.
        </p>
      </div>

      {errorMessage && (
        <section className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
      )}

      {isLoading ? (
        <section className="rounded-sm border border-line bg-panel p-4 text-sm text-muted">
          Cargando plantas...
        </section>
      ) : (
        <div className="space-y-2">
          {plantSettings.map((plantSetting) => {
            const plantFields =
              fieldSettingsByPlantId[plantSetting.plantId] ?? [];

            return (
              <ProjectPlantSettingForm
                key={`${plantSetting.plantId}-${plantSetting.isActive}`}
                plantSetting={plantSetting}
                fieldCount={plantFields.length}
                isOpen={resolvedOpenPlantId === plantSetting.plantId}
                isSaving={isSaving}
                onToggleOpen={() =>
                  setOpenPlantId(
                    resolvedOpenPlantId === plantSetting.plantId
                      ? null
                      : plantSetting.plantId,
                  )
                }
                onSave={handlePlantSave}
              >
                <div>
                  {plantFields.length === 0 ? (
                    <p className="py-3 text-center text-xs text-muted">
                      Esta planta todavía no tiene campos de revisión.
                    </p>
                  ) : (
                    plantFields.map((fieldSetting) => (
                      <PlantCheckFieldSettingForm
                        key={`${fieldSetting.id}-${fieldSetting.updatedAt}`}
                        fieldSetting={fieldSetting}
                        profileId={profileId}
                        isSaving={isSaving}
                        onSave={handleFieldSave}
                        onDelete={handleFieldDelete}
                      />
                    ))
                  )}

                  <NewPlantCheckFieldSettingForm
                    projectId={projectId}
                    plantId={plantSetting.plantId}
                    profileId={profileId}
                    isSaving={isSaving}
                    onSave={handleFieldSave}
                  />
                </div>
              </ProjectPlantSettingForm>
            );
          })}
        </div>
      )}

      <p className="text-xs leading-5 text-muted">
        Antes de desactivar una planta, valida que no sea origen o destino de un
        movimiento abierto.
      </p>
    </section>
  );
}
