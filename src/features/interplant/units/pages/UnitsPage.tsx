import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { UnitCard } from "../components/UnitCard";
import { useUnits } from "../hooks/useUnits";

export function UnitsPage() {
    const { units, isLoading, errorMessage } = useUnits();

    if (isLoading) {
        return <LoadingScreen message="Cargando unidades..." />;
    }

    return (
        <>
            <section className="mb-5">
                <h2 className="text-2xl font-bold">{`Unidades Asignadas`}</h2>
            </section>

            {errorMessage && (
                <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </div>
            )}

            <section className="space-y-4">
                {units.map((unit) => (
                    <UnitCard key={unit.id} unit={unit} />
                ))}
            </section>
        </>
    );
}
