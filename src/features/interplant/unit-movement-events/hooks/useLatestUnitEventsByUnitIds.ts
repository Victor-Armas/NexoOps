import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUnitEventsByUnitIds,
  subscribeToUnitMovementEventsTableChanges,
} from "../services/unit-movement-events.service";
import type { UnitMovementEvent } from "../types/unit-movement-event.types";

type LatestEventsByUnitId = Record<string, UnitMovementEvent>;

function mapLatestEventsByUnitId(events: UnitMovementEvent[]) {
  return events.reduce<LatestEventsByUnitId>((latest, event) => {
    if (!latest[event.unitId]) {
      latest[event.unitId] = event;
    }

    return latest;
  }, {});
}

export function useLatestUnitEventsByUnitIds(
  unitIds: string[],
  shiftId: string | undefined,
) {
  const unitIdsKey = useMemo(() => unitIds.join(","), [unitIds]);
  const contextKey = shiftId && unitIdsKey ? `${shiftId}:${unitIdsKey}` : "";
  const hasContext = contextKey.length > 0;
  const [latestByUnitId, setLatestByUnitId] =
    useState<LatestEventsByUnitId>({});
  const [loadedContextKey, setLoadedContextKey] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!shiftId || !unitIdsKey) {
      return;
    }

    setErrorMessage(null);
    const events = await getUnitEventsByUnitIds(unitIdsKey.split(","));
    setLatestByUnitId(mapLatestEventsByUnitId(events));
  }, [shiftId, unitIdsKey]);

  useEffect(() => {
    if (!hasContext) {
      return;
    }

    let isMounted = true;

    void loadEvents()
      .catch(() => {
        if (isMounted) {
          setErrorMessage("No se pudo cargar el estado actual de las unidades.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadedContextKey(contextKey);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [contextKey, hasContext, loadEvents]);

  const refetch = useCallback(async () => {
    if (!hasContext) {
      return;
    }

    try {
      await loadEvents();
    } catch {
      setErrorMessage("No se pudo cargar el estado actual de las unidades.");
    }
  }, [hasContext, loadEvents]);

  useEffect(() => {
    if (!hasContext) {
      return;
    }

    const channel = subscribeToUnitMovementEventsTableChanges(() => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [hasContext, refetch]);

  return {
    latestByUnitId: hasContext ? latestByUnitId : {},
    isLoading: Boolean(hasContext && loadedContextKey !== contextKey),
    errorMessage: hasContext ? errorMessage : null,
    refetch,
  };
}
