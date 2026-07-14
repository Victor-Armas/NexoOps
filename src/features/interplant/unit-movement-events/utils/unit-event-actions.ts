import type { UnitMovementEventAction } from "../types/unit-movement-event-action.types";
import { getDefaultUnitMovementEventLabel } from "../types/unit-movement-event.types";

const DIESEL_EVENT_TYPES = new Set(["carga_diesel", "recarga_diesel"]);

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
  const configuredColor = findUnitEventAction(actions, eventType)?.colorKey;
  if (configuredColor) return configuredColor;
  if (eventType && DIESEL_EVENT_TYPES.has(eventType)) return "amber";
  return "neutral";
}

export function getUnitEventIconKey(
  actions: UnitMovementEventAction[],
  eventType: string | null | undefined,
) {
  const configuredIcon = findUnitEventAction(actions, eventType)?.iconKey;
  if (configuredIcon) return configuredIcon;
  if (eventType && DIESEL_EVENT_TYPES.has(eventType)) return "fuel";
  return "circle";
}
