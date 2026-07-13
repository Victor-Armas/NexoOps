import { ChevronRight } from "lucide-react";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import { UNIT_MOVEMENT_EVENT_LABELS } from "../../unit-movement-events/types/unit-movement-event.types";
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

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
}

function findNameById<T extends { id: string; name: string }>(
  items: T[] | undefined,
  id: string | null,
  fallback: string,
) {
  if (!id) {
    return fallback;
  }

  return items?.find((item) => item.id === id)?.name ?? fallback;
}

function getStatusLabel(
  latestMovement?: UnitMovement | null,
  latestEvent?: UnitMovementEvent | null,
) {
  if (!latestMovement) {
    return "Disponible";
  }

  if (latestMovement.status !== "open") {
    return UNIT_MOVEMENT_STATUS_LABELS[latestMovement.status];
  }

  if (!latestEvent || latestEvent.eventType === "meal_finished") {
    return "En movimiento";
  }

  return UNIT_MOVEMENT_EVENT_LABELS[latestEvent.eventType];
}

function getStatusTextClassName(
  latestMovement?: UnitMovement | null,
  latestEvent?: UnitMovementEvent | null,
) {
  if (!latestMovement || latestMovement.status === "completed") {
    return "text-success";
  }

  if (latestMovement.status === "cancelled") {
    return "text-danger";
  }

  if (
    latestEvent?.eventType === "meal" ||
    latestEvent?.eventType === "waiting_dock"
  ) {
    return "text-principal";
  }

  return "text-foreground-dark light:text-slate-900";
}

export function UnitCard({
  unit,
  latestMovement,
  latestEvent,
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
  const currentStatusLabel = getStatusLabel(latestMovement, latestEvent);
  const isHighlighted =
    latestMovement?.status === "open" &&
    (latestEvent?.eventType === "meal" ||
      latestEvent?.eventType === "waiting_dock");

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
            latestMovement,
            latestEvent,
          )}`}
        >
          {currentStatusLabel}
        </h3>

        {latestMovement ? (
          <>
            <p className="sub truncate">
              {originName} → {destinationName} ·{" "}
              {formatElapsedTime(latestMovement.startedAt)}
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
