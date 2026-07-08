import { useCallback, useEffect, useState } from "react";
import {
  getOperationalSettings,
  saveOperationalSettings,
} from "../services/operational-settings.service";
import type {
  OperationalSettings,
  SaveOperationalSettingsPayload,
} from "../types/operational-settings.types";

export function useOperationalSettings(projectId: string | undefined) {
  const [settings, setSettings] = useState<OperationalSettings | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!projectId) {
        if (isMounted) {
          setSettings(null);
          setIsLoading(false);
          setErrorMessage("Proyecto no válido.");
        }

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getOperationalSettings(projectId);

        if (isMounted) {
          setSettings(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudo cargar la configuración operativa.");
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

  const saveSettings = useCallback(
    async (payload: SaveOperationalSettingsPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const data = await saveOperationalSettings(payload);
        setSettings(data);

        return data;
      } catch {
        setErrorMessage("No se pudo guardar la configuración operativa.");
        throw new Error("No se pudo guardar la configuración operativa.");
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    settings,
    isLoading,
    isSaving,
    errorMessage,
    saveSettings,
  };
}
