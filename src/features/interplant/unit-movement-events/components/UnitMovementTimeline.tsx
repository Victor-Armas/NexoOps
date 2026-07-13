import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../auth/hooks/useAuth";
import { deleteUnitMovementEvent } from "../services/unit-movement-events.service";
import type { UnitMovementEventAction } from "../types/unit-movement-event-action.types";
import type { UnitMovementEvent } from "../types/unit-movement-event.types";
import {
  getUnitEventLabel,
  isProtectedUnitEvent,
} from "../utils/unit-event-actions";

type UnitMovementTimelineProps = {
  events: UnitMovementEvent[];
  eventActions?: UnitMovementEventAction[];
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
  eventActions = [],
  isLoading,
  errorMessage,
}: UnitMovementTimelineProps) {
  const { can } = useAuth();
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const canDeleteEvents = can("units.event.delete");

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
        Sin eventos registrados.
      </p>
    );
  }

  const handleDelete = async (event: UnitMovementEvent) => {
    const label = getUnitEventLabel(eventActions, event.eventType);
    const confirmed = window.confirm(
      `¿Eliminar realmente la actualización “${label}”? El estado regresará al evento anterior.`,
    );

    if (!confirmed) return;

    try {
      setDeletingEventId(event.id);
      await deleteUnitMovementEvent(event.id);
      toast.success("Actualización eliminada.");
    } catch {
      toast.error("No se pudo eliminar la actualización.");
    } finally {
      setDeletingEventId(null);
    }
  };

  return (
    <section className="mt-5">
      <p className="section-label before:h-px before:flex-1 before:bg-line">
        Timeline
      </p>

      <div className="mt-4 rounded-sm border border-line bg-surface-dark px-4 light:bg-slate-50">
        {events.map((event, index) => {
          const label = getUnitEventLabel(eventActions, event.eventType);
          const isProtected = isProtectedUnitEvent(
            eventActions,
            event.eventType,
          );

          return (
            <article
              key={event.id}
              className={`grid grid-cols-[auto_1fr_auto] items-start gap-4 py-4 ${
                index < events.length - 1
                  ? "border-b border-dashed border-line-strong"
                  : ""
              }`}
            >
              <time className="font-ibm-plex-mono text-sm text-muted">
                {formatTime(event.eventAt)}
              </time>

              <div className="min-w-0">
                <p className="font-medium text-foreground-dark light:text-slate-900">
                  {label}
                </p>

                {event.notes && (
                  <p className="sub mt-1 line-clamp-2">{event.notes}</p>
                )}
              </div>

              {canDeleteEvents && !isProtected && (
                <button
                  type="button"
                  disabled={deletingEventId === event.id}
                  onClick={() => void handleDelete(event)}
                  className="flex h-10 w-10 items-center justify-center rounded-sm border border-danger/40 text-danger transition active:scale-95 disabled:opacity-50"
                  aria-label={`Eliminar ${label}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
