import {
  CheckCircle2,
  CircleSlash2,
  Clock3,
  Package,
  Route,
} from "lucide-react";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type {
  MovementType,
  UnitMovement,
} from "../types/unit-movement.types";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function findNameById<T extends { id: string; name: string }>(
  items: T[],
  id: string | null,
  fallback: string,
) {
  if (!id) return fallback;
  return items.find((item) => item.id === id)?.name ?? fallback;
}

function formatDuration(startedAt: string, completedAt: string | null) {
  if (!completedAt) return null;

  const minutes = Math.max(
    0,
    Math.floor(
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60_000,
    ),
  );

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} h ${remainingMinutes.toString().padStart(2, "0")} min`;
}

type CompletedUnitMovementCardProps = {
  movement: UnitMovement;
  units: Unit[];
  plants: Plant[];
  movementTypes: MovementType[];
};

export function CompletedUnitMovementCard({
  movement,
  units,
  plants,
  movementTypes,
}: CompletedUnitMovementCardProps) {
  const unitName = findNameById(units, movement.unitId, "Unidad");
  const originName = findNameById(
    plants,
    movement.originPlantId,
    "Sin origen",
  );
  const destinationName = findNameById(
    plants,
    movement.destinationPlantId,
    "Sin destino",
  );
  const movementTypeName = findNameById(
    movementTypes,
    movement.movementTypeId,
    "Movimiento",
  );
  const duration = formatDuration(movement.startedAt, movement.completedAt);
  const isCompleted = movement.status === "completed";
  const StatusIcon = isCompleted ? CheckCircle2 : CircleSlash2;

  return (
    <article className="rounded-sm border border-line bg-panel px-4 py-3 light:bg-white">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border ${
            isCompleted
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          <StatusIcon size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground-dark light:text-slate-900">
                {originName} → {destinationName}
              </p>
              <p className="mt-0.5 truncate text-xs text-faint">
                {unitName} · {movementTypeName}
              </p>
            </div>

            <span
              className={`shrink-0 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.08em] ${
                isCompleted ? "text-success" : "text-danger"
              }`}
            >
              {isCompleted ? "Completado" : "Cancelado"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-ibm-plex-mono text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={13} className="text-faint" />
              {DATE_TIME_FORMATTER.format(new Date(movement.startedAt))}
              {movement.completedAt && (
                <> – {DATE_TIME_FORMATTER.format(new Date(movement.completedAt))}</>
              )}
            </span>

            {duration && (
              <span className="inline-flex items-center gap-1.5">
                <Route size={13} className="text-faint" />
                {duration}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5">
              <Package size={13} className="text-faint" />
              {movement.quantity}
            </span>
          </div>

          {movement.notes && (
            <p className="mt-2 truncate text-xs text-faint">{movement.notes}</p>
          )}
        </div>
      </div>
    </article>
  );
}
