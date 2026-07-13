import {
  UNIT_MOVEMENT_EVENT_LABELS,
  type UnitMovementEvent,
} from "../types/unit-movement-event.types";

type UnitMovementTimelineProps = {
  events: UnitMovementEvent[];
  isLoading: boolean;
  errorMessage: string | null;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function UnitMovementTimeline({
  events,
  isLoading,
  errorMessage,
}: UnitMovementTimelineProps) {
  if (isLoading) {
    return <p className="sub mt-5">Cargando timeline...</p>;
  }

  if (errorMessage) {
    return (
      <p className="mt-5 text-sm text-red-400 light:text-red-600">
        {errorMessage}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="mt-5 rounded-sm border border-line bg-surface-dark px-4 py-3 text-sm text-muted light:bg-slate-50">
        Sin eventos registrados en este movimiento.
      </p>
    );
  }

  return (
    <section className="mt-5">
      <p className="section-label before:h-px before:flex-1 before:bg-line">
        Timeline
      </p>

      <div className="mt-4 rounded-sm border border-line bg-surface-dark px-4 light:bg-slate-50">
        {events.map((event, index) => (
          <article
            key={event.id}
            className={`grid grid-cols-[auto_1fr] gap-4 py-4 ${
              index < events.length - 1 ? "border-b border-dashed border-line-strong" : ""
            }`}
          >
            <time className="font-ibm-plex-mono text-sm text-muted">
              {formatTime(event.eventAt)}
            </time>

            <div className="min-w-0">
              <p className="font-medium text-foreground-dark light:text-slate-900">
                {UNIT_MOVEMENT_EVENT_LABELS[event.eventType]}
              </p>

              {event.notes && (
                <p className="sub mt-1 line-clamp-2">{event.notes}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
