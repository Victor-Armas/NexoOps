import { useCallback, useEffect, useState } from "react";
import {
  getProjectUnitSettings,
  saveProjectUnitSetting,
} from "../services/project-unit-settings-admin.service";
import type {
  ProjectUnitSetting,
  SaveProjectUnitSettingPayload,
} from "../types/project-unit-settings-admin.types";

export function useProjectUnitSettingsAdmin(projectId: string | undefined) {
  const [unitSettings, setUnitSettings] = useState<ProjectUnitSetting[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!projectId) {
        if (isMounted) {
          setUnitSettings([]);
          setIsLoading(false);
          setErrorMessage("Proyecto no válido.");
        }

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getProjectUnitSettings(projectId);

        if (isMounted) {
          setUnitSettings(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar las unidades del proyecto.");
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

  const saveUnitSetting = useCallback(
    async (payload: SaveProjectUnitSettingPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const savedUnitSetting = await saveProjectUnitSetting(payload);

        setUnitSettings((currentUnitSettings) =>
          currentUnitSettings
            .map((unitSetting) =>
              unitSetting.unitId === savedUnitSetting.unitId
                ? savedUnitSetting
                : unitSetting,
            )
            .sort((first, second) => first.sortOrder - second.sortOrder),
        );

        return savedUnitSetting;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo guardar la unidad.";

        setErrorMessage(message);
        throw error;
        2;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    unitSettings,
    isLoading,
    isSaving,
    errorMessage,
    saveUnitSetting,
  };
}
