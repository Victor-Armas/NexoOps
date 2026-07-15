import { ChevronRight, Clock3 } from "lucide-react";
import type { UnitMovementEventAction } from "../../unit-movement-events/types/unit-movement-event-action.types";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import type { Plant } from "../../plants/types/plant.types";
import type {
  MovementType,
  UnitMovement,
} from "../../unit-movements/types/unit-movement.types";
import { resolveUnitOperationalSnapshot } from "../../unit-movements/utils/unit-operational-snapshot";
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

function getHeadlineClass(colorKey: string, isAvailable: boolean) {
  if (isAvailable) return "text-success";
  if (colorKey === "amber") return "text-principal";
  if (colorKey === "blue") return "text-blue-300 light:text-blue-700";
  if (colorKey === "success") return "text-success";
  if (colorKey === "danger") return "text-danger";
  return "text-foreground-dark light:text-slate-900";
}

export function UnitCard({
  unit,
  latestMovement = null,
  latestEvent = null,
  eventActions,
  plants = [],
  movementTypes = [],
}: UnitCardProps) {
  const snapshot = resolveUnitOperationalSnapshot({
    unit,
    movement: latestMovement,
    event: latestEvent,
    eventActions,
    plants,
    movementTypes,
  });
  const movementDetails = [
    snapshot.movementTypeLabel,
    snapshot.quantity !== null ? `${snapshot.quantity} unidades` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={`grid min-h-[104px] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-sm border bg-panel px-4 py-3 transition hover:border-principal/60 light:bg-white ${
        snapshot.isWaiting || snapshot.colorKey === "danger"
          ? "border-principal/50 border-l-4 border-l-principal"
          : "border-line"
      }`}
    >
      <div className="mincard min-w-16 text-base light:text-slate-900">
        {snapshot.unitLabel}
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h3
            className={`truncate text-lg font-semibold ${getHeadlineClass(
              snapshot.colorKey,
              snapshot.isAvailable,
            )}`}
          >
            {snapshot.headline}
          </h3>
        </div>

        <p className="sub mt-1 truncate">
          {snapshot.isAvailable
            ? "Sin movimiento activo"
            : `${snapshot.phaseLabel} · ${snapshot.routeLabel}`}
        </p>

        {!snapshot.isAvailable && (
          <p className="mt-1 flex items-center gap-1.5 truncate font-ibm-plex-mono text-[11px] text-faint">
            {snapshot.statusStartedAt && <Clock3 size={12} className="shrink-0" />}
            <span className="truncate">
              {movementDetails || "Movimiento activo"}
              {snapshot.statusStartedAt
                ? ` · ${formatElapsedTime(snapshot.statusStartedAt)}`
                : ""}
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.1em] text-faint">
          {snapshot.phaseLabel}
        </span>
        <ChevronRight size={18} className="text-faint" />
      </div>
    </article>
  );
}
