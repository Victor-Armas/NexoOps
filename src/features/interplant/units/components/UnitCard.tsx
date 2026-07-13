import { ChevronRight } from "lucide-react";
import type { UnitMovementEventAction } from "../../unit-movement-events/types/unit-movement-event-action.types";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import {
  getUnitEventColorKey,
  getUnitEventLabel,
} from "../../unit-movement-events/utils/unit-event-actions";
import { isStandaloneActiveUnitEvent } from "../../unit-movement-events/utils/unit-event-status";
import type { Plant } from "../../plants/types/plant.types";
import type {
  MovementType,
  UnitMovement,
} from "../../unit-movements/types/unit-movement.types";
import { UNIT_MOVEMENT_STATUS_LABELS } from "../../unit-movements/types/unit-movement.types";
import type { Unit } from "../types/unit.types";

type UnitCardProps = {
  unit: Unit;
  latestMovement?: UnitMovement | null;
  latestEvent?: UnitMovementEvent | null;
  eventActions: UnitMovementEventAction[];
  plants?: Plant[];
  movementTypes?: MovementType[];
};

function formatElapsedTime(startedAt: string) {
  const diffInMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 60_000),
  );

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
}

function findNameById<T extends { id: string; name: string }>(
  items: T[] | undefined,
  id: string | null,
  fallback: string,
) {
  if (!id) return fallback;
  return items?.find((item) => item.id === id)?.name ?? fallback;
}

function getStatusTextClassName(
  eventActions: UnitMovementEventAction[],
  latestMovement?: UnitMovement | null,
  latestEvent?: UnitMovementEvent | null,
) {
  const colorKey = getUnitEventColorKey(
    eventActions,
    latestEvent?.eventType,
  );

  if (colorKey === "amber") return "text-principal";
  if (colorKey === "blue") return "text-blue-300 light:text-blue-700";
  if (colorKey === "success") return "text-success";
  if (colorKey === "danger") return "text-danger";

  if (!latestMovement || latestMovement.status === "completed") {
    return "text-success";
  }

  if (latestMovement.status === "cancelled") return "text-danger";
  return "text-foreground-dark light:text-slate-900";
}

export function UnitCard({
  unit,
  latestMovement,
  latestEvent,
  eventActions,
  plants,
  movementTypes,
}: UnitCardProps) {
  const originName = findNameById(
    plants,
    latestMovement?.originPlantId ?? null,
    "Sin origen",
  );
  const destinationName = findNameById(
    plants,
    latestMovement?.destinationPlantId ?? null,
    "Sin destino",
  );
  const movementTypeName = findNameById(
    movementTypes,
    latestMovement?.movementTypeId ?? null,
    "Movimiento",
  );

  const standaloneActive = isStandaloneActiveUnitEvent(
    latestEvent,
    eventActions,
  );

  const currentStatusLabel = standaloneActive && latestEvent
    ? getUnitEventLabel(eventActions, latestEvent.eventType)
    : !latestMovement
      ? "Disponible"
      : latestMovement.status !== "open"
        ? UNIT_MOVEMENT_STATUS_LABELS[latestMovement.status]
        : latestEvent
          ? getUnitEventLabel(eventActions, latestEvent.eventType)
          : "En movimiento";

  const colorKey = getUnitEventColorKey(
    eventActions,
    latestEvent?.eventType,
  );
  const isHighlighted =
    standaloneActive ||
    colorKey === "amber" ||
    colorKey === "danger";

  return (
    <article
      className={`grid min-h-[92px] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-sm border bg-panel px-4 py-3 transition hover:border-principal/60 light:bg-white ${
        isHighlighted
          ? "border-principal/50 border-l-4 border-l-principal"
          : "border-line"
      }`}
    >
      <div className="mincard min-w-16 text-base light:text-slate-900">
        U{unit.code}
      </div>

      <div className="min-w-0">
        <h3
          className={`truncate text-lg font-semibold ${getStatusTextClassName(
            eventActions,
            latestMovement,
            latestEvent,
          )}`}
        >
          {currentStatusLabel}
        </h3>

        {standaloneActive && latestEvent ? (
          <p className="sub truncate">
            Sin movimiento activo · {formatElapsedTime(latestEvent.eventAt)}
          </p>
        ) : latestMovement ? (
          <>
            <p className="sub truncate">
              {originName} → {destinationName} ·{" "}
              {formatElapsedTime(latestEvent?.eventAt ?? latestMovement.startedAt)}
            </p>
            <p className="mt-1 truncate font-ibm-plex-mono text-[11px] text-faint">
              {movementTypeName} · {latestMovement.quantity}
            </p>
          </>
        ) : (
          <p className="sub truncate">Sin movimiento activo</p>
        )}
      </div>

      <ChevronRight size={18} className="text-faint" />
    </article>
  );
}
