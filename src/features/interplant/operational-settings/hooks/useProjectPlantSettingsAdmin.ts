import { useCallback, useEffect, useState } from "react";
import {
  getProjectPlantSettings,
  saveProjectPlantSetting,
} from "../services/project-plant-settings-admin.service";
import type {
  ProjectPlantSetting,
  SaveProjectPlantSettingPayload,
} from "../types/project-plant-settings-admin.types";

function compareByName(first: ProjectPlantSetting, second: ProjectPlantSetting) {
  return first.name.localeCompare(second.name, "es-MX", {
    numeric: true,
    sensitivity: "base",
  });
}

export function useProjectPlantSettingsAdmin(projectId: string | undefined) {
  const [plantSettings, setPlantSettings] = useState<ProjectPlantSetting[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!projectId) {
        if (isMounted) {
          setPlantSettings([]);
          setIsLoading(false);
          setErrorMessage("Proyecto no válido.");
        }

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getProjectPlantSettings(projectId);

        if (isMounted) {
          setPlantSettings(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar las plantas del proyecto.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const savePlantSetting = useCallback(
    async (payload: SaveProjectPlantSettingPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const savedPlantSetting = await saveProjectPlantSetting(payload);

        setPlantSettings((currentPlantSettings) =>
          currentPlantSettings
            .map((plantSetting) =>
              plantSetting.plantId === savedPlantSetting.plantId
                ? savedPlantSetting
                : plantSetting,
            )
            .sort(compareByName),
        );

        return savedPlantSetting;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo guardar la planta.";

        setErrorMessage(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    plantSettings,
    isLoading,
    isSaving,
    errorMessage,
    savePlantSetting,
  };
}
