import type { UnitMovementEventAction } from "../types/unit-movement-event-action.types";
import { getDefaultUnitMovementEventLabel } from "../types/unit-movement-event.types";

export function findUnitEventAction(
  actions: UnitMovementEventAction[],
  eventType: string | null | undefined,
) {
  if (!eventType) return null;
  return actions.find((action) => action.eventType === eventType) ?? null;
}

export function getUnitEventLabel(
  actions: UnitMovementEventAction[],
  eventType: string,
) {
  return (
    findUnitEventAction(actions, eventType)?.label ??
    getDefaultUnitMovementEventLabel(eventType)
  );
}

export function getMovementStatusActions(actions: UnitMovementEventAction[]) {
  return actions.filter(
    (action) =>
      action.isActive && action.showAsAction && action.behavior === "status",
  );
}

export function getStandaloneStatusActions(actions: UnitMovementEventAction[]) {
  return getMovementStatusActions(actions).filter(
    (action) => !action.requiresMovement,
  );
}

export function isProtectedUnitEvent(
  actions: UnitMovementEventAction[],
  eventType: string,
) {
  const behavior = findUnitEventAction(actions, eventType)?.behavior;
  return (
    behavior === "movement_complete" ||
    behavior === "movement_cancel" ||
    eventType === "completed" ||
    eventType === "cancelled"
  );
}

export function getUnitEventColorKey(
  actions: UnitMovementEventAction[],
  eventType: string | null | undefined,
) {
  return findUnitEventAction(actions, eventType)?.colorKey ?? "neutral";
}

export function getUnitEventIconKey(
  actions: UnitMovementEventAction[],
  eventType: string | null | undefined,
) {
  return findUnitEventAction(actions, eventType)?.iconKey ?? "circle";
}
