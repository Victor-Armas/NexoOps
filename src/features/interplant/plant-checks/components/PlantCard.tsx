import { Building2, Clock3 } from "lucide-react";
import {
    PLANT_RISK_LABELS,
    type PlantCheck,
} from "../../plant-checks/types/plant-check.types";
import type { Plant } from "../../plants/types/plant.types";

type PlantCardProps = {
    plant: Plant;
    latestCheck?: PlantCheck | null;
};

function formatTime(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function PlantCard({ plant, latestCheck }: PlantCardProps) {
    return (
        <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur transition hover:border-cyan-400/50 hover:bg-cyan-400/10 light:border-slate-200 light:bg-white light:hover:border-cyan-500">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <Building2 size={24} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="font-semibold">{plant.name}</h3>

                            <p className="mt-1 line-clamp-2 text-sm text-slate-400 light:text-slate-500">
                                {plant.description ?? "Sin descripción"}
                            </p>
                        </div>

                        {latestCheck && (
                            <span className="shrink-0 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                                {PLANT_RISK_LABELS[latestCheck.riskLevel]}
                            </span>
                        )}
                    </div>

                    {latestCheck ? (
                        <>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-2xl bg-slate-950/40 p-3 light:bg-slate-50">
                                    <p className="text-xs text-slate-400">Llenos</p>
                                    <p className="text-lg font-bold">{latestCheck.fullCount}</p>
                                </div>

                                <div className="rounded-2xl bg-slate-950/40 p-3 light:bg-slate-50">
                                    <p className="text-xs text-slate-400">Vacíos</p>
                                    <p className="text-lg font-bold">{latestCheck.emptyCount}</p>
                                </div>

                                <div className="rounded-2xl bg-slate-950/40 p-3 light:bg-slate-50">
                                    <p className="text-xs text-slate-400">Pend.</p>
                                    <p className="text-lg font-bold">
                                        {latestCheck.pendingCount}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 light:text-slate-500">
                                <Clock3 size={14} />
                                <span>Última revisión: {formatTime(latestCheck.checkedAt)}</span>
                            </div>
                        </>
                    ) : (
                        <p className="mt-4 rounded-2xl bg-slate-950/40 px-4 py-3 text-sm text-slate-400 light:bg-slate-50 light:text-slate-500">
                            Sin estatus registrado en este turno.
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}