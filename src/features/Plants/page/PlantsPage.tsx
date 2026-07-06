import { LoadingScreen } from "../../../components/layout/LoadingScreen";
import { PlantCard } from "../components/PlantCard";
import { usePlants } from "../hooks/usePlants";

export function PlantsPage() {
    const { plants, isLoading, errorMessage } = usePlants();

    if (isLoading) {
        return <LoadingScreen message="Cargando plantas..." />;
    }

    return (
        <>

            <section className="mb-5">
                <h2 className="text-2xl font-bold">{`Plantas Asignadas`}</h2>
            </section>


            {errorMessage && (
                <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </div>
            )}

            <section className="space-y-4">
                {plants.map((plant) => (
                    <PlantCard key={plant.id} plant={plant} />
                ))}
            </section>
        </>
    );
}