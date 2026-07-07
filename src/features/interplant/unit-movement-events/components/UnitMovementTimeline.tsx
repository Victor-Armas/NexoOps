import { Clock3 } from "lucide-react";
import {
    UNIT_MOVEMENT_EVENT_LABELS,
    type UnitMovementEvent,
} from "../types/unit-movement-event.types";

type UnitMovementTimelineProps = {
    events: UnitMovementEvent[];
    isLoading: boolean;
    errorMessage: string | null;
};

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
    }).format(new Date(value));
}

export function UnitMovementTimeline({
    events,
    isLoading,
    errorMessage,
}: UnitMovementTimelineProps) {
    if (isLoading) {
        return (
            <p className="mt-4 text-sm text-slate-400 light:text-slate-500">
                Cargando timeline...
            </p>
        );
    }

    if (errorMessage) {
        return (
            <p className="mt-4 text-sm text-red-400 light:text-red-600">
                {errorMessage}
            </p>
        );
    }

    if (events.length === 0) {
        return (
            <p className="mt-4 rounded-3xl bg-slate-950/30 px-4 py-3 text-sm text-slate-400 light:bg-slate-50 light:text-slate-500">
                Sin eventos registrados en este movimiento.
            </p>
        );
    }

    return (
        <section className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
            <h4 className="text-sm font-bold">Timeline</h4>

            <div className="mt-3 space-y-3">
                {events.map((event) => (
                    <article key={event.id} className="flex gap-3">
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                            <Clock3 size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">
                                {UNIT_MOVEMENT_EVENT_LABELS[event.eventType]}
                            </p>

                            <p className="text-xs text-slate-400 light:text-slate-500">
                                {formatDateTime(event.eventAt)}
                            </p>

                            {event.notes && (
                                <p className="mt-1 text-sm text-slate-300 light:text-slate-600">
                                    {event.notes}
                                </p>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}