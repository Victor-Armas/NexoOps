import { Boxes } from "lucide-react";
import type { Project } from "../types/project.types";

type ProjectCardProps = {
    project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
    return (
        <article className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl icon-principal light:bg-cyan-100 light:text-cyan-700">
                    <Boxes size={26} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-principal light:text-cyan-700">
                        {project.code}
                    </p>

                    <h2 className="mt-1 text-xl font-bold">{project.name}</h2>

                    {project.description && (
                        <p className="mt-1 text-sm infield light:text-slate-500">
                            {project.description}
                        </p>
                    )}
                </div>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 light:bg-emerald-100 light:text-emerald-700">
                    Activo
                </span>
            </div>
        </article>
    );
}