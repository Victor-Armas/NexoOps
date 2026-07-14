import { useCallback, useEffect, useState } from "react";
import {
  getUnitMovementEventActionSettingsByProject,
  saveUnitMovementEventActionSetting,
} from "../services/unit-movement-event-action-settings-admin.service";
import type {
  SaveUnitMovementEventActionSettingPayload,
  UnitMovementEventActionSetting,
} from "../types/unit-movement-event-action-settings-admin.types";

function compareActionSettings(
  first: UnitMovementEventActionSetting,
  second: UnitMovementEventActionSetting,
) {
  return first.label.localeCompare(second.label, "es-MX", {
    numeric: true,
    sensitivity: "base",
  });
}

export function useUnitMovementEventActionSettingsAdmin(
  projectId: string | undefined,
) {
  const [actionSettings, setActionSettings] = useState<
    UnitMovementEventActionSetting[]
  >([]);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!projectId) {
        if (isMounted) {
          setActionSettings([]);
          setIsLoading(false);
          setErrorMessage("Proyecto no válido.");
        }

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data =
          await getUnitMovementEventActionSettingsByProject(projectId);

        if (isMounted) {
          setActionSettings(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar los botones de estado.");
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

  const saveActionSetting = useCallback(
    async (payload: SaveUnitMovementEventActionSettingPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const savedActionSetting =
          await saveUnitMovementEventActionSetting(payload);

        setActionSettings((currentActionSettings) => {
          const exists = currentActionSettings.some(
            (actionSetting) =>
              actionSetting.eventType === savedActionSetting.eventType,
          );

          if (!exists) {
            return [...currentActionSettings, savedActionSetting].sort(
              compareActionSettings,
            );
          }

          return currentActionSettings
            .map((actionSetting) =>
              actionSetting.eventType === savedActionSetting.eventType
                ? savedActionSetting
                : actionSetting,
            )
            .sort(compareActionSettings);
        });

        return savedActionSetting;
      } catch {
        setErrorMessage("No se pudo guardar el botón de estado.");
        throw new Error("No se pudo guardar el botón de estado.");
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    actionSettings,
    isLoading,
    isSaving,
    errorMessage,
    saveActionSetting,
  };
}
