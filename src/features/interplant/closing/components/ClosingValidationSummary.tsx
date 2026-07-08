import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type {
    MovementClosingMetrics,
    PlantClosingMetrics,
} from "../utils/closing-metrics";

type ClosingValidationSummaryProps = {
    plantMetrics: PlantClosingMetrics;
    movementMetrics: MovementClosingMetrics;
};

export function ClosingValidationSummary({
    plantMetrics,
    movementMetrics,
}: ClosingValidationSummaryProps) {
    const hasOpenMovements = movementMetrics.openMovements.length > 0;

    return (
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <div className="mb-4 flex items-center gap-3">
                {hasOpenMovements ? (
                    <AlertTriangle className="text-yellow-300" size={24} />
                ) : (
                    <CheckCircle2 className="text-emerald-400" size={24} />
                )}

                <div>
                    <h3 className="font-bold">Validación para cierre</h3>
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        El turno solo debe cerrarse sin movimientos abiertos.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Plantas revisadas
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {plantMetrics.checkedPlants}/{plantMetrics.totalPlants}
                    </p>
                </article>

                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Mov. abiertos
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {movementMetrics.openMovements.length}
                    </p>
                </article>

                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Completados
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {movementMetrics.completedMovements.length}
                    </p>
                </article>

                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Cantidad movida
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {movementMetrics.totalQuantity}
                    </p>
                </article>
            </div>
        </section>
    );
}