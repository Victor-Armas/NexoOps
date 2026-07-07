import { useCallback, useEffect, useState } from "react";
import {
  createUnitMovementEvent,
  getUnitMovementEvents,
  subscribeToUnitMovementEventsChanges,
} from "../services/unit-movement-events.service";
import type {
  CreateUnitMovementEventPayload,
  UnitMovementEvent,
} from "../types/unit-movement-event.types";

export function useUnitMovementEvents(unitMovementId: string | undefined) {
  const [unitMovementEvents, setUnitMovementEvents] = useState<
    UnitMovementEvent[]
  >([]);
  const [isLoading, setIsLoading] = useState(Boolean(unitMovementId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!unitMovementId) {
      return;
    }

    let isMounted = true;

    void getUnitMovementEvents(unitMovementId)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setUnitMovementEvents(data);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage("No se pudo cargar el timeline del movimiento.");
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
  }, [unitMovementId]);

  const refetch = useCallback(async () => {
    if (!unitMovementId) {
      setUnitMovementEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getUnitMovementEvents(unitMovementId);

      setUnitMovementEvents(data);
    } catch {
      setErrorMessage("No se pudo cargar el timeline del movimiento.");
    } finally {
      setIsLoading(false);
    }
  }, [unitMovementId]);

  useEffect(() => {
    if (!unitMovementId) {
      return;
    }

    const channel = subscribeToUnitMovementEventsChanges(unitMovementId, () => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [unitMovementId, refetch]);

  const addUnitMovementEvent = useCallback(
    async (payload: CreateUnitMovementEventPayload) => {
      const created = await createUnitMovementEvent(payload);

      setUnitMovementEvents((currentEvents) => [created, ...currentEvents]);
    },
    [],
  );

  return {
    unitMovementEvents,
    latestEvent: unitMovementEvents[0] ?? null,
    isLoading,
    errorMessage,
    addUnitMovementEvent,
    refetch,
  };
}
