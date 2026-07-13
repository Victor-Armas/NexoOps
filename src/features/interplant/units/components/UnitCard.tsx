import { Clock3, MapPin, Truck } from "lucide-react";
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

    if (latestMovement.status !== "open") {
        return UNIT_MOVEMENT_STATUS_LABELS[latestMovement.status];
    }

    if (!latestEvent) {
        return "En movimiento";
    }

    if (latestEvent.eventType === "meal_finished") {
        return "En movimiento";
    }

    return UNIT_MOVEMENT_EVENT_LABELS[latestEvent.eventType];
}

function getStatusClassName(
    latestMovement?: UnitMovement | null,
    latestEvent?: UnitMovementEvent | null,
) {
    if (!latestMovement) {
        return "bg-emerald-400/10 text-emerald-300 light:bg-emerald-100 light:text-emerald-700";
    }

    if (latestMovement.status === "cancelled") {
        return "bg-red-400/10 text-red-300 light:bg-red-100 light:text-red-700";
    }

    if (latestMovement.status !== "open") {
        return "bg-emerald-400/10 text-emerald-300 light:bg-emerald-100 light:text-emerald-700";
    }

    if (latestEvent?.eventType === "meal") {
        return "bg-yellow-400/10 text-yellow-200 light:bg-yellow-100 light:text-yellow-700";
    }

    if (latestEvent?.eventType === "waiting_dock") {
        return "bg-yellow-400/10 text-yellow-200 light:bg-yellow-100 light:text-yellow-700";
    }

    if (
        latestEvent?.eventType === "loading" ||
        latestEvent?.eventType === "unloading"
    ) {
        return "bg-blue-400/10 text-blue-300 light:bg-blue-100 light:text-blue-700";
    }

    return "bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700";
}

function getCardClassName(
    latestMovement?: UnitMovement | null,
    latestEvent?: UnitMovementEvent | null,
) {
    if (latestMovement?.status === "open" && latestEvent?.eventType === "meal") {
        return "border-yellow-400/40 bg-yellow-400/10 light:border-yellow-300 light:bg-yellow-50";
    }

    if (
        latestMovement?.status === "open" &&
        latestEvent?.eventType === "waiting_dock"
    ) {
        return "border-yellow-400/30 bg-yellow-400/5 light:border-yellow-300 light:bg-yellow-50";
    }

    return "card hover:border-principal/50 hover:bg-principal/10 light:border-slate-200 light:bg-white light:hover:border-cyan-500";
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
        <article
            className={`flex justify-between rounded-sm border p-5 transition ${getCardClassName(
                latestMovement,
                latestEvent,
            )}`}
        >
            <div className="flex items-start gap-4">
                <div className="mincard text-white ">
                    <p>U{unit.code}</p>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-principal light:text-cyan-700">
                                Unidad {unit.code}
                            </p>

                            <h2 className="mt-1 text-xl font-bold">{unit.name}</h2>
                        </div>


                    </div>

                    {latestMovement && (
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

                            {isOpen && latestMovement.shiftId && (
                                <p className="mt-3 rounded-2xl bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 light:bg-cyan-50 light:text-cyan-700">
                                    Movimiento abierto. Si viene de un turno anterior, se puede
                                    continuar desde aquí.
                                </p>
                            )}

                            {latestMovement.notes && (
                                <p className="mt-3 line-clamp-2 text-sm text-slate-300 light:text-slate-600">
                                    {latestMovement.notes}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div>
                <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(
                        latestMovement,
                        latestEvent,
                    )}`}
                >
                    {currentStatusLabel}
                </span>
            </div>
        </article>
    );
}