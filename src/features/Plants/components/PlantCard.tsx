import { Factory } from "lucide-react";
import type { Plant } from "../types/plant.types";

type PlantCardProps = {
    plant: Plant;
};

export function PlantCard({ plant }: PlantCardProps) {
    return (
        <article className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <Factory size={26} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 light:text-cyan-700">
                        {plant.code}
                    </p>

                    <h2 className="mt-1 text-xl font-bold">{plant.name}</h2>

                    {plant.description && (
                        <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                            {plant.description}
                        </p>
                    )}
                </div>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 light:bg-emerald-100 light:text-emerald-700">
                    Activa
                </span>
            </div>
        </article>
    );
}