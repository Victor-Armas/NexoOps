import { Clock3, MapPin, Truck } from "lucide-react";
import type {
    UnitMovementEvent,
} from "../../unit-movement-events/types/unit-movement-event.types";
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

function formatTime(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatElapsedTime(startedAt: string) {
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

    if (latestMovement.status === "open" && latestEvent) {
        return UNIT_MOVEMENT_EVENT_LABELS[latestEvent.eventType];
    }

    if (latestMovement.status === "open") {
        return "En movimiento";
    }

    return UNIT_MOVEMENT_STATUS_LABELS[latestMovement.status];
}

function getStatusClassName(latestMovement?: UnitMovement | null) {
    if (!latestMovement) {
        return "bg-emerald-400/10 text-emerald-300 light:bg-emerald-100 light:text-emerald-700";
    }

    if (latestMovement.status === "open") {
        return "bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700";
    }

    if (latestMovement.status === "cancelled") {
        return "bg-red-400/10 text-red-300 light:bg-red-100 light:text-red-700";
    }

    return "bg-emerald-400/10 text-emerald-300 light:bg-emerald-100 light:text-emerald-700";
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

    const isOpen = latestMovement?.status === "open";

    const currentStatusLabel = getStatusLabel(latestMovement, latestEvent);

    return (
        <article className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl transition hover:border-cyan-400/50 hover:bg-cyan-400/10 light:border-slate-200 light:bg-white light:hover:border-cyan-500">
            <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <Truck size={26} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 light:text-cyan-700">
                                Unidad {unit.code}
                            </p>

                            <h2 className="mt-1 text-xl font-bold">{unit.name}</h2>
                        </div>

                        <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(
                                latestMovement,
                            )}`}
                        >
                            {currentStatusLabel}
                        </span>
                    </div>

                    {latestMovement ? (
                        <>
                            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4 light:border-slate-200 light:bg-slate-50">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="font-semibold">{originName}</span>
                                    <span className="text-cyan-300 light:text-cyan-700">→</span>
                                    <span className="font-semibold">{destinationName}</span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-400 light:text-slate-500">
                                            Tipo
                                        </p>
                                        <p className="font-semibold">{movementTypeName}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400 light:text-slate-500">
                                            Cantidad
                                        </p>
                                        <p className="font-semibold">{latestMovement.quantity}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 light:text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                    <Clock3 size={14} />
                                    {isOpen
                                        ? `Activo: ${formatElapsedTime(latestMovement.startedAt)}`
                                        : `Último: ${formatTime(latestMovement.startedAt)}`}
                                </span>

                                <span className="inline-flex items-center gap-1">
                                    <MapPin size={14} />
                                    {currentStatusLabel}
                                </span>
                            </div>

                            {latestMovement.notes && (
                                <p className="mt-3 line-clamp-2 text-sm text-slate-300 light:text-slate-600">
                                    {latestMovement.notes}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="mt-4 rounded-3xl bg-slate-950/40 px-4 py-3 text-sm text-slate-400 light:bg-slate-50 light:text-slate-500">
                            Sin movimiento registrado en este turno.
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}