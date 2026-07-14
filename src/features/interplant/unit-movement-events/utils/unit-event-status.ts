import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";
import type {
  UnitMovementEventAction,
  UnitMovementEventBehavior,
} from "../types/unit-movement-event-action.types";
import {
  DIESEL_REFUELING_FINISHED_EVENT,
  type UnitMovementEvent,
} from "../types/unit-movement-event.types";
import { findUnitEventAction } from "./unit-event-actions";

const INACTIVE_STANDALONE_BEHAVIORS = new Set<UnitMovementEventBehavior>([
  "meal_end",
  "fuel_end",
  "movement_complete",
  "movement_cancel",
]);

const INACTIVE_FALLBACK_EVENT_TYPES = new Set([
  "meal_finished",
  "completed",
  "cancelled",
  DIESEL_REFUELING_FINISHED_EVENT,
]);

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
    return !INACTIVE_STANDALONE_BEHAVIORS.has(behavior);
  }

  return !INACTIVE_FALLBACK_EVENT_TYPES.has(event.eventType);
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
