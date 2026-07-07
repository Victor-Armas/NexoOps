import { Clock3 } from "lucide-react";
import type { PlantCheck } from "../types/plant-check.types";
import { PLANT_RISK_LABELS } from "../types/plant-check.types";

type PlantCheckHistoryProps = {
    plantChecks: PlantCheck[];
};

function formatTime(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function PlantCheckHistory({ plantChecks }: PlantCheckHistoryProps) {
    if (plantChecks.length === 0) {
        return (
            <section className="rounded-4xl border border-white/10 bg-white/10 p-5 text-sm text-slate-400 light:border-slate-200 light:bg-white light:text-slate-500">
                Aún no hay estatus registrados para esta planta en el turno actual.
            </section>
        );
    }

    return (
        <section className="space-y-3">
            <h2 className="text-lg font-bold">Historial del turno</h2>

            {plantChecks.map((plantCheck) => (
                <article
                    key={plantCheck.id}
                    className="rounded-3xl border border-white/10 bg-white/10 p-4 light:border-slate-200 light:bg-white"
                >
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-400 light:text-slate-500">
                            <Clock3 size={16} />
                            <span>{formatTime(plantCheck.checkedAt)}</span>
                        </div>

                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                            Riesgo {PLANT_RISK_LABELS[plantCheck.riskLevel]}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-2xl bg-slate-950/40 p-3 light:bg-slate-50">
                            <p className="text-xs text-slate-400">Llenos</p>
                            <p className="text-xl font-bold">{plantCheck.fullCount}</p>
                        </div>

                        <div className="rounded-2xl bg-slate-950/40 p-3 light:bg-slate-50">
                            <p className="text-xs text-slate-400">Vacíos</p>
                            <p className="text-xl font-bold">{plantCheck.emptyCount}</p>
                        </div>

                        <div className="rounded-2xl bg-slate-950/40 p-3 light:bg-slate-50">
                            <p className="text-xs text-slate-400">Pend.</p>
                            <p className="text-xl font-bold">{plantCheck.pendingCount}</p>
                        </div>
                    </div>

                    {plantCheck.notes && (
                        <p className="mt-3 text-sm text-slate-300 light:text-slate-600">
                            {plantCheck.notes}
                        </p>
                    )}
                </article>
            ))}
        </section>
    );
}