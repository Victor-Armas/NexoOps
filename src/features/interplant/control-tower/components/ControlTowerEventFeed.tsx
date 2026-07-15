import { Activity, Radio } from "lucide-react";
import type { UnitMovementEventAction } from "../../unit-movement-events/types/unit-movement-event-action.types";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import { getUnitEventLabel } from "../../unit-movement-events/utils/unit-event-actions";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";

type ControlTowerEventFeedProps = {
  events: UnitMovementEvent[];
  eventActions: UnitMovementEventAction[];
  plants: Plant[];
  units: Unit[];
};

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function getPhaseText(event: UnitMovementEvent, plantName?: string) {
  if (plantName) return plantName;
  if (event.phase === "transit") return "En traslado";
  if (event.phase === "origin") return "Origen";
  if (event.phase === "destination") return "Destino";
  return null;
}

export function ControlTowerEventFeed({
  events,
  eventActions,
  plants,
  units,
}: ControlTowerEventFeedProps) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-panel/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Radio size={17} className="text-principal" />
          <h2 className="font-barlow-condensed text-sm font-bold uppercase tracking-[0.08em]">
            Bitácora en vivo
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 font-ibm-plex-mono text-[9px] uppercase tracking-[0.08em] text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          {events.length} eventos
        </span>
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-0 overflow-y-auto pr-1">
        {events.map((event, index) => {
          const unit = units.find((item) => item.id === event.unitId);
          const plant = plants.find((item) => item.id === event.plantId);
          const phaseText = getPhaseText(event, plant?.code);
          const label = getUnitEventLabel(eventActions, event.eventType);

          return (
            <article
              key={event.id}
              className={`grid grid-cols-[auto_1fr] gap-3 border-b border-line/70 py-3 last:border-b-0 ${
                index === 0 ? "animate-[pulse_1.2s_ease-out_1]" : ""
              }`}
            >
              <div className="pt-0.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line-strong bg-surface-dark text-principal">
                  <Activity size={13} />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm leading-5 text-foreground-dark">
                    <strong className="font-ibm-plex-mono text-principal">
                      {unit ? `U${unit.code}` : "Unidad"}
                    </strong>{" "}
                    {label.toLowerCase()}
                    {phaseText ? ` · ${phaseText}` : ""}
                  </p>
                  <time className="shrink-0 font-ibm-plex-mono text-[9px] text-faint">
                    {formatEventTime(event.eventAt)}
                  </time>
                </div>

                {event.notes && (
                  <p className="mt-1 line-clamp-2 font-ibm-plex-mono text-[9px] leading-4 text-muted">
                    {event.notes}
                  </p>
                )}
              </div>
            </article>
          );
        })}

        {events.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            Todavía no hay actividad reciente para mostrar.
          </div>
        )}
      </div>
    </section>
  );
}
