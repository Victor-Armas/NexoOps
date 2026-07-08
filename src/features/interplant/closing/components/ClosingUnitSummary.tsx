import type { MovementClosingMetrics } from "../utils/closing-metrics";

type ClosingUnitSummaryProps = {
    movementMetrics: MovementClosingMetrics;
};

export function ClosingUnitSummary({
    movementMetrics,
}: ClosingUnitSummaryProps) {
    return (
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <h3 className="font-bold">Resumen de unidades</h3>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Movimientos
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {movementMetrics.totalMovements}
                    </p>
                </article>

                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Cancelados
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {movementMetrics.cancelledMovements.length}
                    </p>
                </article>

                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Esperando rampa
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {movementMetrics.waitingDockCount}
                    </p>
                </article>

                <article className="rounded-3xl bg-slate-950/40 p-4 light:bg-slate-50">
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Carga/descarga
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {movementMetrics.loadingOrUnloadingCount}
                    </p>
                </article>
            </div>
        </section>
    );
}