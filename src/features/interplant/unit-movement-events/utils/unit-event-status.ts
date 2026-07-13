import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";
import type { UnitMovementEventAction } from "../types/unit-movement-event-action.types";
import type { UnitMovementEvent } from "../types/unit-movement-event.types";
import { findUnitEventAction } from "./unit-event-actions";

export function isStandaloneActiveUnitEvent(
  event: UnitMovementEvent | null | undefined,
  eventActions: UnitMovementEventAction[] = [],
) {
  if (!event || event.unitMovementId !== null) return false;

  const behavior = findUnitEventAction(
    eventActions,
    event.eventType,
  )?.behavior;

  if (behavior) {
    return ![
      "meal_end",
      "movement_complete",
      "movement_cancel",
    ].includes(behavior);
  }

  return !["meal_finished", "completed", "cancelled"].includes(
    event.eventType,
  );
}

export function resolveCurrentUnitEvent(params: {
  movement: UnitMovement | null;
  movementEvent: UnitMovementEvent | null;
  latestUnitEvent: UnitMovementEvent | null;
  eventActions?: UnitMovementEventAction[];
}) {
  const {
    movement,
    movementEvent,
    latestUnitEvent,
    eventActions = [],
  } = params;

  if (!latestUnitEvent) {
    return movementEvent;
  }

  if (
    latestUnitEvent.unitMovementId === null &&
    !isStandaloneActiveUnitEvent(latestUnitEvent, eventActions)
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
