import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createUnitMovementEvent,
  deleteUnitMovementEvent,
  getUnitEvents,
  subscribeToUnitEventsChanges,
} from "../services/unit-movement-events.service";
import type {
  CreateUnitMovementEventPayload,
  UnitMovementEvent,
} from "../types/unit-movement-event.types";

export function useUnitEvents(
  unitId: string | undefined,
  shiftId: string | undefined,
) {
  const [events, setEvents] = useState<UnitMovementEvent[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(unitId && shiftId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!unitId || !shiftId) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getUnitEvents({ unitId, shiftId });
      setEvents(data);
    } catch {
      setErrorMessage("No se pudieron cargar los eventos de la unidad.");
    } finally {
      setIsLoading(false);
    }
  }, [shiftId, unitId]);

  useEffect(() => {
    if (!unitId || !shiftId) {
      return;
    }

    let isMounted = true;

    void getUnitEvents({ unitId, shiftId })
      .then((data) => {
        if (!isMounted) return;
        setEvents(data);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorMessage("No se pudieron cargar los eventos de la unidad.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const channel = subscribeToUnitEventsChanges(unitId, () => {
      void refetch();
    });

    return () => {
      isMounted = false;
      void channel.unsubscribe();
    };
  }, [refetch, shiftId, unitId]);

  const standaloneEvents = useMemo(
    () => events.filter((event) => event.unitMovementId === null),
    [events],
  );

  const latestStandaloneEvent = standaloneEvents[0] ?? null;
  const latestMealStart = standaloneEvents.find(
    (event) => event.eventType === "meal",
  );
  const latestMealFinished = standaloneEvents.find(
    (event) => event.eventType === "meal_finished",
  );
  const isMealActive = Boolean(
    latestMealStart &&
      (!latestMealFinished ||
        new Date(latestMealStart.eventAt).getTime() >
          new Date(latestMealFinished.eventAt).getTime()),
  );

  const addEvent = useCallback(
    async (
      payload: Omit<CreateUnitMovementEventPayload, "unitId" | "shiftId">,
    ) => {
      if (!unitId || !shiftId) {
        throw new Error("No hay unidad o turno activo.");
      }

      const created = await createUnitMovementEvent({
        ...payload,
        unitId,
        shiftId,
      });

      setEvents((current) => [created, ...current]);
      return created;
    },
    [shiftId, unitId],
  );

  const removeEvent = useCallback(async (eventId: string) => {
    await deleteUnitMovementEvent(eventId);
    setEvents((current) => current.filter((event) => event.id !== eventId));
  }, []);

  return {
    events,
    standaloneEvents,
    latestStandaloneEvent,
    latestMealStart: latestMealStart ?? null,
    isMealActive,
    isLoading,
    errorMessage,
    addEvent,
    removeEvent,
    refetch,
  };
}
