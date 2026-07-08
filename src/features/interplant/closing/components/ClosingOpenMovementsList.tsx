import { XCircle } from "lucide-react";
import {
    UNIT_MOVEMENT_EVENT_LABELS,
    type UnitMovementEvent,
} from "../../unit-movement-events/types/unit-movement-event.types";
import {
    UNIT_MOVEMENT_STATUS_LABELS,
    type UnitMovement,
} from "../../unit-movements/types/unit-movement.types";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import { findNameById } from "../utils/closing-formatters";

type ClosingOpenMovementsListProps = {
    openMovements: UnitMovement[];
    units: Unit[];
    plants: Plant[];
    latestByMovementId: Record<string, UnitMovementEvent>;
};

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
        <section className="mt-5 rounded-4xl border border-yellow-400/20 bg-yellow-400/10 p-5 shadow-xl light:border-yellow-200 light:bg-yellow-50">
            <div className="mb-4 flex items-center gap-3 text-yellow-200 light:text-yellow-700">
                <XCircle size={22} />
                <h3 className="font-bold">Movimientos pendientes</h3>
            </div>

            <div className="space-y-3">
                {openMovements.map((movement) => {
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

                    const latestEvent = latestByMovementId[movement.id];

                    const statusLabel = latestEvent
                        ? UNIT_MOVEMENT_EVENT_LABELS[latestEvent.eventType]
                        : UNIT_MOVEMENT_STATUS_LABELS[movement.status];

                    return (
                        <article
                            key={movement.id}
                            className="rounded-3xl bg-slate-950/30 p-4 text-sm light:bg-white"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-bold">{unitName}</p>
                                    <p className="mt-1 text-slate-300 light:text-slate-600">
                                        {originName} → {destinationName}
                                    </p>
                                </div>

                                <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-200 light:bg-yellow-100 light:text-yellow-700">
                                    {statusLabel}
                                </span>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}