import type { UnitMovementEventAction } from "../types/unit-movement-event-action.types";
import {
  DIESEL_REFUELING_FINISHED_EVENT,
  DIESEL_REFUELING_STARTED_EVENT,
  getDefaultUnitMovementEventLabel,
} from "../types/unit-movement-event.types";

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
  const action = findUnitEventAction(actions, eventType);
  return (
    action?.behavior === "movement_complete" ||
    action?.behavior === "movement_cancel" ||
    Boolean(
      action?.isSystem &&
        action.requiresMovement &&
        action.behavior === "status" &&
        !action.showAsAction,
    ) ||
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
  if (eventType === DIESEL_REFUELING_STARTED_EVENT) return "amber";
  if (eventType === DIESEL_REFUELING_FINISHED_EVENT) return "success";
  return "neutral";
}

export function getUnitEventIconKey(
  actions: UnitMovementEventAction[],
  eventType: string | null | undefined,
) {
  const configuredIcon = findUnitEventAction(actions, eventType)?.iconKey;
  if (configuredIcon) return configuredIcon;
  if (
    eventType === DIESEL_REFUELING_STARTED_EVENT ||
    eventType === DIESEL_REFUELING_FINISHED_EVENT
  ) {
    return "fuel";
  }
  return "circle";
}
