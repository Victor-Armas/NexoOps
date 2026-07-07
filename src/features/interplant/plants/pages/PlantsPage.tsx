import { useNavigate, useParams } from "react-router-dom";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { PlantCard } from "../components/PlantCard";
import { usePlants } from "../hooks/usePlants";

export function PlantsPage() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const { plants, isLoading, errorMessage } = usePlants(projectId);

    if (isLoading) {
        return <LoadingScreen message="Cargando plantas..." />;
    }

    return (
        <>
            <section className="mb-5">
                <h2 className="text-2xl font-bold">Plantas</h2>
                <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                    Selecciona una planta para consultar o registrar estatus.
                </p>
            </section>

            {errorMessage && (
                <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </div>
            )}

            <section className="space-y-4">
                {plants.map((plant) => (
                    <button
                        key={plant.id}
                        type="button"
                        onClick={() =>
                            navigate(`/app/projects/${projectId}/plants/${plant.id}`)
                        }
                        className="block w-full text-left"
                    >
                        <PlantCard plant={plant} />
                    </button>
                ))}
            </section>

            {plants.length === 0 && !errorMessage && (
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-sm text-slate-400 light:border-slate-200 light:bg-white light:text-slate-500">
                    No hay plantas asignadas a este proyecto.
                </div>
            )}
        </>
    );
}