import { useEffect, useState } from "react";
import type { UnitMovementEventAction } from "../types/unit-movement-event-action.types";
import { registerUnitMovementEventLabels } from "../types/unit-movement-event.types";
import {
  getDefaultUnitMovementEventActions,
  getUnitMovementEventActionSettings,
} from "../services/unit-movement-event-actions.service";

function applyActions(
  actions: UnitMovementEventAction[],
  setActions: (actions: UnitMovementEventAction[]) => void,
) {
  registerUnitMovementEventLabels(actions);
  setActions(actions);
}

export function useUnitMovementEventActions(projectId: string | undefined) {
  const defaultActions = getDefaultUnitMovementEventActions();
  const [actions, setActions] = useState<UnitMovementEventAction[]>(defaultActions);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!projectId) {
        if (isMounted) {
          applyActions(getDefaultUnitMovementEventActions(), setActions);
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
          applyActions(
            data.length > 0 ? data : getDefaultUnitMovementEventActions(),
            setActions,
          );
        }
      } catch {
        if (isMounted) {
          applyActions(getDefaultUnitMovementEventActions(), setActions);
          setErrorMessage(
            "No se pudieron cargar los estatus configurados. Se usó la configuración base.",
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
