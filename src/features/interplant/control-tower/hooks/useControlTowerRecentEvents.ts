import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRecentUnitEventsByUnitIds,
  subscribeToUnitMovementEventsTableChanges,
} from "../../unit-movement-events/services/unit-movement-events.service";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";

const RECENT_EVENTS_LIMIT = 29;

export function useControlTowerRecentEvents(unitIds: string[]) {
  const unitIdsKey = useMemo(
    () => [...unitIds].sort().join(","),
    [unitIds],
  );
  const contextKey = unitIdsKey || "empty";
  const [events, setEvents] = useState<UnitMovementEvent[]>([]);
  const [resolvedContextKey, setResolvedContextKey] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!unitIdsKey) return [];

    return getRecentUnitEventsByUnitIds(
      unitIdsKey.split(","),
      RECENT_EVENTS_LIMIT,
    );
  }, [unitIdsKey]);

  const refetch = useCallback(async () => {
    try {
      const data = await loadEvents();
      setEvents(data);
      setErrorMessage(null);
    } catch {
      setErrorMessage("No se pudo actualizar la bitácora en vivo.");
    }
  }, [loadEvents]);

  useEffect(() => {
    let isMounted = true;

    void loadEvents()
      .then((data) => {
        if (!isMounted) return;
        setEvents(data);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorMessage("No se pudo cargar la bitácora en vivo.");
      })
      .finally(() => {
        if (isMounted) setResolvedContextKey(contextKey);
      });

    return () => {
      isMounted = false;
    };
  }, [contextKey, loadEvents]);

  useEffect(() => {
    if (!unitIdsKey) return;

    const channel = subscribeToUnitMovementEventsTableChanges(() => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [refetch, unitIdsKey]);

  return {
    events,
    isLoading: resolvedContextKey !== contextKey,
    errorMessage,
    refetch,
  };
}
