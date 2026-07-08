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
            <div className="mb-4 flex items-start gap-3 text-yellow-200 light:text-yellow-700">
                <AlertTriangle size={22} className="mt-0.5 shrink-0" />

                <div>
                    <h3 className="font-bold">Movimientos abiertos</h3>

                    <p className="mt-1 text-sm text-yellow-100/80 light:text-yellow-700/80">
                        Estos movimientos no bloquean el cierre. Quedan
                        heredables para continuar en el siguiente turno.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
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

                    return (
                        <article
                            key={movement.id}
                            className="rounded-3xl bg-slate-950/30 p-4 text-sm light:bg-white"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-bold">{unitLabel}</p>

                                    <p className="mt-1 text-slate-300 light:text-slate-600">
                                        {originName} → {destinationName}
                                    </p>
                                </div>

                                <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-200 light:bg-yellow-100 light:text-yellow-700">
                                    {statusLabel}
                                </span>
                            </div>

                            <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-400 light:text-slate-500">
                                <Clock3 size={14} />
                                Activo: {formatElapsedTime(movement.startedAt)}
                            </p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}