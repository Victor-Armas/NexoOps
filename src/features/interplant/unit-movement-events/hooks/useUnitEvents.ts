import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createUnitMovementEvent,
  deleteUnitMovementEvent,
  getStandaloneMealEvents,
  getUnitEvents,
  subscribeToUnitEventsChanges,
} from "../services/unit-movement-events.service";
import type {
  CreateUnitMovementEventPayload,
  UnitMovementEvent,
} from "../types/unit-movement-event.types";

const DIESEL_START_EVENTS = ["carga_diesel", "recarga_diesel"];
const DIESEL_END_EVENTS = [
  "carga_diesel_finalizada",
  "recarga_diesel_finalizada",
];

export function useUnitEvents(
  unitId: string | undefined,
  shiftId: string | undefined,
) {
  const [events, setEvents] = useState<UnitMovementEvent[]>([]);
  const [mealEvents, setMealEvents] = useState<UnitMovementEvent[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(unitId && shiftId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!unitId || !shiftId) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [currentShiftEvents, standaloneMealEvents] = await Promise.all([
        getUnitEvents({ unitId, shiftId }),
        getStandaloneMealEvents(unitId),
      ]);
      setEvents(currentShiftEvents);
      setMealEvents(standaloneMealEvents);
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
  const latestMealStart = mealEvents.find((event) => event.eventType === "meal");
  const latestMealFinished = mealEvents.find(
    (event) => event.eventType === "meal_finished",
  );
  const isMealActive = Boolean(
    latestMealStart &&
      (!latestMealFinished ||
        new Date(latestMealStart.eventAt).getTime() >
          new Date(latestMealFinished.eventAt).getTime()),
  );

  const latestDieselStart = standaloneEvents.find((event) =>
    DIESEL_START_EVENTS.includes(event.eventType),
  );
  const latestDieselFinished = standaloneEvents.find((event) =>
    DIESEL_END_EVENTS.includes(event.eventType),
  );
  const isFuelingActive = Boolean(
    latestDieselStart &&
      (!latestDieselFinished ||
        new Date(latestDieselStart.eventAt).getTime() >
          new Date(latestDieselFinished.eventAt).getTime()),
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
        (created.eventType === "meal" || created.eventType === "meal_finished")
      ) {
        setMealEvents((current) => [created, ...current]);
      }

      return created;
    },
    [shiftId, unitId],
  );

  const removeEvent = useCallback(async (eventId: string) => {
    await deleteUnitMovementEvent(eventId);
    setEvents((current) => current.filter((event) => event.id !== eventId));
    setMealEvents((current) => current.filter((event) => event.id !== eventId));
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
