import type { PlantClosingMetrics } from "../utils/closing-metrics";

type ClosingPlantSummaryProps = {
    plantMetrics: PlantClosingMetrics;
};

export function ClosingPlantSummary({
    plantMetrics,
}: ClosingPlantSummaryProps) {
    return (
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <h3 className="font-bold">Resumen de plantas</h3>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Llenos
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {plantMetrics.fullCount}
                    </p>
                </article>

                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Vacíos
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {plantMetrics.emptyCount}
                    </p>
                </article>

                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Pendientes
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {plantMetrics.pendingCount}
                    </p>
                </article>

                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Riesgo alto
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {plantMetrics.highRiskPlants}
                    </p>
                </article>
            </div>

            {plantMetrics.missingPlants > 0 && (
                <p className="mt-4 rounded-3xl bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200 light:bg-yellow-50 light:text-yellow-700">
                    Faltan {plantMetrics.missingPlants} planta(s) por revisar en este
                    turno.
                </p>
            )}
        </section>
    );
}