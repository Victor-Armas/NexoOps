import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";
import type { UnitMovementEvent } from "../types/unit-movement-event.types";

export function isStandaloneActiveUnitEvent(
  event: UnitMovementEvent | null | undefined,
) {
  return (
    event?.unitMovementId === null &&
    (event.eventType === "meal" || event.eventType === "driver_change")
  );
}

export function resolveCurrentUnitEvent(params: {
  movement: UnitMovement | null;
  movementEvent: UnitMovementEvent | null;
  latestUnitEvent: UnitMovementEvent | null;
}) {
  const { movement, movementEvent, latestUnitEvent } = params;

  if (!latestUnitEvent) {
    return movementEvent;
  }

  if (
    latestUnitEvent.unitMovementId === null &&
    latestUnitEvent.eventType === "meal_finished"
  ) {
    return movementEvent;
  }

  if (
    movement?.status === "open" &&
    new Date(movement.startedAt).getTime() >
      new Date(latestUnitEvent.eventAt).getTime()
  ) {
    return movementEvent;
  }

  if (!movementEvent) {
    return latestUnitEvent;
  }

  return new Date(latestUnitEvent.eventAt).getTime() >=
    new Date(movementEvent.eventAt).getTime()
    ? latestUnitEvent
    : movementEvent;
}
