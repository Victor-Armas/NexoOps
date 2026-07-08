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

  const [latestByMovementId, setLatestByMovementId] =
    useState<LatestEventsByMovementId>({});
  const [isLoading, setIsLoading] = useState(Boolean(movementIdsKey));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!movementIdsKey) {
      return;
    }

    let isMounted = true;
    const movementIds = movementIdsKey.split(",");

    void getUnitMovementEventsByMovementIds(movementIds)
      .then((events) => {
        if (!isMounted) {
          return;
        }

        setLatestByMovementId(mapLatestEventsByMovementId(events));
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage("No se pudo cargar el estado actual de las unidades.");
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [movementIdsKey]);

  const refetch = useCallback(async () => {
    if (!movementIdsKey) {
      setLatestByMovementId({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const movementIds = movementIdsKey.split(",");
      const events = await getUnitMovementEventsByMovementIds(movementIds);

      setLatestByMovementId(mapLatestEventsByMovementId(events));
    } catch {
      setErrorMessage("No se pudo cargar el estado actual de las unidades.");
    } finally {
      setIsLoading(false);
    }
  }, [movementIdsKey]);

  useEffect(() => {
    if (!movementIdsKey) {
      return;
    }

    const channel = subscribeToUnitMovementEventsTableChanges(() => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [movementIdsKey, refetch]);

  return {
    latestByMovementId,
    isLoading,
    errorMessage,
    refetch,
  };
}
