import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import { UNIT_MOVEMENT_EVENT_LABELS } from "../../unit-movement-events/types/unit-movement-event.types";
import type { Unit } from "../../units/types/unit.types";
import type { UnitMovement } from "../types/unit-movement.types";
import { UNIT_MOVEMENT_STATUS_LABELS } from "../types/unit-movement.types";

export function formatElapsedTime(startedAt: string) {
  const diffInMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000),
  );

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes}m`;
}

export function getUnitLabel(
  units: Unit[],
  unitId: string,
  fallback = "Unidad",
) {
  const unit = units.find((item) => item.id === unitId);

  if (!unit) {
    return fallback;
  }

  return `Unidad ${unit.code}`;
}

export function getCurrentUnitMovementStatusLabel({
  movement,
  latestEvent,
  emptyLabel = "Disponible",
  openFallbackLabel = "En movimiento",
}: {
  movement?: UnitMovement | null;
  latestEvent?: UnitMovementEvent | null;
  emptyLabel?: string;
  openFallbackLabel?: string;
}) {
  if (!movement) {
    return emptyLabel;
  }

  if (movement.status !== "open") {
    return UNIT_MOVEMENT_STATUS_LABELS[movement.status];
  }

  if (!latestEvent) {
    return openFallbackLabel;
  }

  if (latestEvent.eventType === "meal_finished") {
    return "En movimiento";
  }

  return UNIT_MOVEMENT_EVENT_LABELS[latestEvent.eventType];
}
