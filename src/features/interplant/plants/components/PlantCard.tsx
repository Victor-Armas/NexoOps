import { Building2 } from "lucide-react";
import type { Plant } from "../types/plant.types";

type PlantCardProps = {
    plant: Plant;
};

export function PlantCard({ plant }: PlantCardProps) {
    return (
        <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur transition hover:border-cyan-400/50 hover:bg-cyan-400/10 light:border-slate-200 light:bg-white light:hover:border-cyan-500">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <Building2 size={24} />
                </div>

                <div className="min-w-0 flex-1">


                    <h3 className="mt-1 font-semibold">{plant.name}</h3>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-400 light:text-slate-500">
                        {plant.description ?? "Sin descripción"}
                    </p>
                </div>
            </div>
        </article>
    );
}