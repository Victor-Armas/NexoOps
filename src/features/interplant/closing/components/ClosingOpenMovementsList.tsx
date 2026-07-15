import { AlertTriangle, Clock3 } from "lucide-react";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import {
  formatElapsedTime,
  getCurrentUnitMovementStatusLabel,
  getUnitLabel,
} from "../../unit-movements/utils/unit-movement-formatters";
import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import { findNameById } from "../utils/closing-formatters";

type ClosingOpenMovementsListProps = {
  openMovements: UnitMovement[];
  units: Unit[];
  plants: Plant[];
  latestByMovementId: Record<string, UnitMovementEvent>;
};

function getPhaseLabel(event?: UnitMovementEvent) {
  if (event?.phase === "origin") return "Origen";
  if (event?.phase === "transit") return "Traslado";
  if (event?.phase === "destination") return "Destino";
  return "En proceso";
}

export function ClosingOpenMovementsList({
  openMovements,
  units,
  plants,
  latestByMovementId,
}: ClosingOpenMovementsListProps) {
  if (openMovements.length === 0) {
    return null;
  }

  return (
    <section className="rounded-sm border border-principal/40 bg-principal/10 p-4">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-principal/50 bg-principal/10 text-principal">
          <AlertTriangle size={20} className="animate-pulse" />
        </span>
        <div>
          <p className="font-barlow-condensed text-lg font-bold text-principal">
            Movimientos abiertos
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            No bloquean el cierre y conservarán su etapa para continuar en el siguiente turno.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {openMovements.map((movement) => {
          const unitLabel = getUnitLabel(units, movement.unitId);
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
          const latestEvent = latestByMovementId[movement.id];
          const statusLabel = getCurrentUnitMovementStatusLabel({
            movement,
            latestEvent,
            openFallbackLabel: "Movimiento abierto",
          });
          const currentPlant = latestEvent?.plantId
            ? plants.find((plant) => plant.id === latestEvent.plantId)
            : latestEvent?.phase === "origin"
              ? plants.find((plant) => plant.id === movement.originPlantId)
              : latestEvent?.phase === "destination"
                ? plants.find((plant) => plant.id === movement.destinationPlantId)
                : null;
          const operationalStatus = currentPlant
            ? `${statusLabel} en ${currentPlant.code}`
            : statusLabel;
          const statusStartedAt = latestEvent?.eventAt ?? movement.startedAt;

          return (
            <article
              key={movement.id}
              className="rounded-sm border border-line bg-panel p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{unitLabel}</p>
                    <span className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.08em] text-faint">
                      {getPhaseLabel(latestEvent)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">
                    {originName} → {destinationName}
                  </p>
                </div>
                <span className="shrink-0 rounded-sm border border-principal/40 px-2 py-1 text-right font-ibm-plex-mono text-[9px] uppercase text-principal">
                  {operationalStatus}
                </span>
              </div>

              <p className="mt-3 inline-flex items-center gap-1.5 font-ibm-plex-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                <Clock3 size={13} />
                Estado actual {formatElapsedTime(statusStartedAt)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
