import { useEffect, useState } from "react";
import type { UnitMovementEventAction } from "../types/unit-movement-event-action.types";
import {
  getDefaultUnitMovementEventActions,
  getUnitMovementEventActionSettings,
} from "../services/unit-movement-event-actions.service";

export function useUnitMovementEventActions(projectId: string | undefined) {
  const [actions, setActions] = useState<UnitMovementEventAction[]>(
    getDefaultUnitMovementEventActions(),
  );
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!projectId) {
        if (isMounted) {
          setActions(getDefaultUnitMovementEventActions());
          setIsLoading(false);
          setErrorMessage(null);
        }

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getUnitMovementEventActionSettings(projectId);

        if (isMounted) {
          setActions(
            data.length > 0 ? data : getDefaultUnitMovementEventActions(),
          );
        }
      } catch {
        if (isMounted) {
          setActions(getDefaultUnitMovementEventActions());
          setErrorMessage(
            "No se pudieron cargar los botones configurados. Se usó la configuración base.",
          );
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

  return {
    actions,
    isLoading,
    errorMessage,
  };
}
