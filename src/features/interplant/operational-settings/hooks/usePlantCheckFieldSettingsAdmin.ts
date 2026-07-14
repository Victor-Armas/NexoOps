import { useCallback, useEffect, useState } from "react";
import {
  deletePlantCheckFieldSetting,
  getPlantCheckFieldSettingsByProject,
  savePlantCheckFieldSetting,
} from "../services/plant-check-field-settings-admin.service";
import type {
  PlantCheckFieldSetting,
  SavePlantCheckFieldSettingPayload,
} from "../types/plant-check-field-settings-admin.types";

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

export function usePlantCheckFieldSettingsAdmin(projectId: string | undefined) {
  const [fieldSettings, setFieldSettings] = useState<PlantCheckFieldSetting[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFieldSettings = useCallback(async () => {
    if (!projectId) {
      setFieldSettings([]);
      setIsLoading(false);
      setErrorMessage("Proyecto no válido.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getPlantCheckFieldSettingsByProject(projectId);
      setFieldSettings(data);
    } catch {
      setErrorMessage("No se pudieron cargar los campos de revisión.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!isMounted) {
        return;
      }

      await loadFieldSettings();
    });

    return () => {
      isMounted = false;
    };
  }, [loadFieldSettings]);

  const saveFieldSetting = useCallback(
    async (payload: SavePlantCheckFieldSettingPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const savedFieldSetting = await savePlantCheckFieldSetting(payload);

        setFieldSettings((currentFieldSettings) => {
          const exists = currentFieldSettings.some(
            (fieldSetting) => fieldSetting.id === savedFieldSetting.id,
          );

          if (!exists) {
            return [...currentFieldSettings, savedFieldSetting].sort(
              compareFieldSettings,
            );
          }

          return currentFieldSettings
            .map((fieldSetting) =>
              fieldSetting.id === savedFieldSetting.id
                ? savedFieldSetting
                : fieldSetting,
            )
            .sort(compareFieldSettings);
        });

        return savedFieldSetting;
      } catch {
        setErrorMessage("No se pudo guardar el campo de revisión.");
        throw new Error("No se pudo guardar el campo de revisión.");
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const removeFieldSetting = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);

      await deletePlantCheckFieldSetting(id);

      setFieldSettings((currentFieldSettings) =>
        currentFieldSettings.filter((fieldSetting) => fieldSetting.id !== id),
      );
    } catch {
      setErrorMessage("No se pudo eliminar el campo de revisión.");
      throw new Error("No se pudo eliminar el campo de revisión.");
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    fieldSettings,
    isLoading,
    isSaving,
    errorMessage,
    refetch: loadFieldSettings,
    saveFieldSetting,
    removeFieldSetting,
  };
}
