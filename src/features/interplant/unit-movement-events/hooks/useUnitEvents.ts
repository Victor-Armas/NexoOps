import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createUnitMovementEvent,
  deleteUnitMovementEvent,
  getStandaloneBlockingEvents,
  getUnitEvents,
  subscribeToUnitEventsChanges,
} from "../services/unit-movement-events.service";
import {
  DIESEL_REFUELING_FINISHED_EVENT,
  DIESEL_REFUELING_STARTED_EVENT,
  type CreateUnitMovementEventPayload,
  type UnitMovementEvent,
} from "../types/unit-movement-event.types";

const BLOCKING_EVENT_TYPES = new Set([
  "meal",
  "meal_finished",
  DIESEL_REFUELING_STARTED_EVENT,
  DIESEL_REFUELING_FINISHED_EVENT,
]);

function isStandaloneProcessActive(
  events: UnitMovementEvent[],
  startEventType: string,
  endEventType: string,
) {
  const latestStart = events.find(
    (event) => event.eventType === startEventType,
  );
  const latestEnd = events.find((event) => event.eventType === endEventType);

  return Boolean(
    latestStart &&
      (!latestEnd ||
        new Date(latestStart.eventAt).getTime() >
          new Date(latestEnd.eventAt).getTime()),
  );
}

export function useUnitEvents(
  unitId: string | undefined,
  shiftId: string | undefined,
) {
  const [events, setEvents] = useState<UnitMovementEvent[]>([]);
  const [blockingEvents, setBlockingEvents] = useState<UnitMovementEvent[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(unitId && shiftId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!unitId || !shiftId) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [currentShiftEvents, currentBlockingEvents] = await Promise.all([
        getUnitEvents({ unitId, shiftId }),
        getStandaloneBlockingEvents(unitId),
      ]);
      setEvents(currentShiftEvents);
      setBlockingEvents(currentBlockingEvents);
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

    void Promise.resolve().then(refetch);

    const channel = subscribeToUnitEventsChanges(unitId, () => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [refetch, shiftId, unitId]);

  const standaloneEvents = useMemo(
    () => events.filter((event) => event.unitMovementId === null),
    [events],
  );

  const latestStandaloneEvent = standaloneEvents[0] ?? null;
  const latestMealStart = blockingEvents.find(
    (event) => event.eventType === "meal",
  );
  const isMealActive = isStandaloneProcessActive(
    blockingEvents,
    "meal",
    "meal_finished",
  );
  const isFuelingActive = isStandaloneProcessActive(
    blockingEvents,
    DIESEL_REFUELING_STARTED_EVENT,
    DIESEL_REFUELING_FINISHED_EVENT,
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

      if (
        created.unitMovementId === null &&
        BLOCKING_EVENT_TYPES.has(created.eventType)
      ) {
        setBlockingEvents((current) => [created, ...current]);
      }

      return created;
    },
    [shiftId, unitId],
  );

  const removeEvent = useCallback(async (eventId: string) => {
    await deleteUnitMovementEvent(eventId);
    setEvents((current) => current.filter((event) => event.id !== eventId));
    setBlockingEvents((current) =>
      current.filter((event) => event.id !== eventId),
    );
  }, []);

  return {
    events,
    standaloneEvents,
    latestStandaloneEvent,
    latestMealStart: latestMealStart ?? null,
    isMealActive,
    isFuelingActive,
    isLoading,
    errorMessage,
    addEvent,
    removeEvent,
    refetch,
  };
}
