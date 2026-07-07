import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "../../../components/layout/LoadingScreen";
import { ProjectCard } from "../components/ProjectCard";
import { useProjects } from "../hooks/useProjects";

export function ProjectMenuPage() {
    const navigate = useNavigate();
    const { projects, isLoading, errorMessage } = useProjects();

    if (isLoading) {
        return <LoadingScreen message="Cargando proyectos..." />;
    }

    return (
        <>
            <section className="mb-5">
                <h2 className="text-2xl font-bold">Proyectos asignados</h2>
                <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                    Selecciona una operación para continuar
                </p>
            </section>

            {errorMessage && (
                <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </div>
            )}

            <section className="space-y-4">
                {projects.map((project) => (
                    <button
                        key={project.id}
                        type="button"
                        onClick={() => navigate(`/app/projects/${project.id}`)}
                        className="block w-full text-left"
                    >
                        <ProjectCard project={project} />
                    </button>
                ))}
            </section>
        </>
    );
}