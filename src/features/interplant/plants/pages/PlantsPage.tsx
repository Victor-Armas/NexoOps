import { useNavigate, useParams } from "react-router-dom";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useLatestPlantChecksByShift } from "../../plant-checks/hooks/useLatestPlantChecksByShift";
import { useShift } from "../../shifts/hooks/useShift";
import { PlantCard } from "../components/PlantCard";
import { usePlants } from "../hooks/usePlants";

export function PlantsPage() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { profile } = useAuth();

    const {
        plants,
        isLoading: isLoadingPlants,
        errorMessage: plantsErrorMessage,
    } = usePlants(projectId);

    const {
        shift,
        isLoading: isLoadingShift,
        errorMessage: shiftErrorMessage,
    } = useShift(projectId, profile?.id);

    const {
        latestByPlantId,
        isLoading: isLoadingLatestChecks,
        errorMessage: latestChecksErrorMessage,
    } = useLatestPlantChecksByShift(shift?.id);

    const isLoading =
        isLoadingPlants || isLoadingShift || isLoadingLatestChecks;

    const errorMessage =
        plantsErrorMessage || shiftErrorMessage || latestChecksErrorMessage;

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

            {!shift && (
                <section className="mb-5 rounded-4xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm text-yellow-200 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
                    No hay turno abierto. Abre un turno para registrar estatus por planta.
                </section>
            )}

            {errorMessage && (
                <div className="mb-5 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
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
                        <PlantCard
                            plant={plant}
                            latestCheck={latestByPlantId[plant.id] ?? null}
                        />
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