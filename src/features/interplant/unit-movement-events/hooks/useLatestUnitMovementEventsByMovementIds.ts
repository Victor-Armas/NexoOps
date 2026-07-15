import { useCallback, useEffect, useMemo, useState } from "react";
import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";
import {
  getUnitMovementEventsByMovementIds,
  subscribeToUnitMovementEventsTableChanges,
} from "../services/unit-movement-events.service";
import type { UnitMovementEvent } from "../types/unit-movement-event.types";

type LatestEventsByMovementId = Record<string, UnitMovementEvent>;

function mapLatestEventsByMovementId(
  events: UnitMovementEvent[],
): LatestEventsByMovementId {
  return events.reduce<LatestEventsByMovementId>((latestEvents, event) => {
    if (!event.unitMovementId) {
      return latestEvents;
    }

    if (!latestEvents[event.unitMovementId]) {
      latestEvents[event.unitMovementId] = event;
    }

    return latestEvents;
  }, {});
}

export function useLatestUnitMovementEventsByMovementIds(
  unitMovements: UnitMovement[],
) {
  const movementIdsKey = useMemo(
    () => unitMovements.map((movement) => movement.id).join(","),
    [unitMovements],
  );

  const hasMovementIds = movementIdsKey.length > 0;
  const [latestByMovementId, setLatestByMovementId] =
    useState<LatestEventsByMovementId>({});
  const [loadedMovementIdsKey, setLoadedMovementIdsKey] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hasMovementIds) {
      return;
    }

    let isMounted = true;

    async function loadLatestEvents() {
      try {
        setErrorMessage(null);

        const movementIds = movementIdsKey.split(",");
        const events = await getUnitMovementEventsByMovementIds(movementIds);

        if (isMounted) {
          setLatestByMovementId(mapLatestEventsByMovementId(events));
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudo cargar el estado actual de las unidades.");
        }
      } finally {
        if (isMounted) {
          setLoadedMovementIdsKey(movementIdsKey);
        }
      }
    }

    void loadLatestEvents();

    return () => {
      isMounted = false;
    };
  }, [hasMovementIds, movementIdsKey]);

  const refetch = useCallback(async () => {
    if (!hasMovementIds) {
      return;
    }

    try {
      setErrorMessage(null);

      const movementIds = movementIdsKey.split(",");
      const events = await getUnitMovementEventsByMovementIds(movementIds);

      setLatestByMovementId(mapLatestEventsByMovementId(events));
    } catch {
      setErrorMessage("No se pudo cargar el estado actual de las unidades.");
    }
  }, [hasMovementIds, movementIdsKey]);

  useEffect(() => {
    if (!hasMovementIds) {
      return;
    }

    const channel = subscribeToUnitMovementEventsTableChanges(() => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [hasMovementIds, refetch]);

  return {
    latestByMovementId: hasMovementIds ? latestByMovementId : {},
    isLoading: Boolean(
      hasMovementIds && loadedMovementIdsKey !== movementIdsKey,
    ),
    errorMessage: hasMovementIds ? errorMessage : null,
    refetch,
  };
}
