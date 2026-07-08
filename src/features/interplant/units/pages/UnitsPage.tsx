import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useLatestUnitMovementEventsByMovementIds } from "../../unit-movement-events/hooks/useLatestUnitMovementEventsByMovementIds";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { useLatestUnitMovementsByShift } from "../../unit-movements/hooks/useLatestUnitMovementsByShift";
import { useMovementTypes } from "../../unit-movements/hooks/useMovementTypes";
import { UnitCard } from "../components/UnitCard";
import { useUnits } from "../hooks/useUnits";

export function UnitsPage() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { profile } = useAuth();

    const {
        shift,
        isLoading: isLoadingShift,
        errorMessage: shiftErrorMessage,
    } = useShift(projectId, profile?.id);

    const {
        units,
        isLoading: isLoadingUnits,
        errorMessage: unitsErrorMessage,
    } = useUnits(projectId);

    const {
        plants,
        isLoading: isLoadingPlants,
        errorMessage: plantsErrorMessage,
    } = usePlants(projectId);

    const {
        movementTypes,
        isLoading: isLoadingMovementTypes,
        errorMessage: movementTypesErrorMessage,
    } = useMovementTypes();

    const {
        latestByUnitId,
        isLoading: isLoadingLatestMovements,
        errorMessage: latestMovementsErrorMessage,
    } = useLatestUnitMovementsByShift(shift?.id);

    const latestMovements = useMemo(
        () => Object.values(latestByUnitId),
        [latestByUnitId],
    );

    const {
        latestByMovementId,
        isLoading: isLoadingLatestEvents,
        errorMessage: latestEventsErrorMessage,
    } = useLatestUnitMovementEventsByMovementIds(latestMovements);

    const isLoading =
        isLoadingShift ||
        isLoadingUnits ||
        isLoadingPlants ||
        isLoadingMovementTypes ||
        Boolean(shift && (isLoadingLatestMovements || isLoadingLatestEvents));

    const errorMessage =
        shiftErrorMessage ||
        unitsErrorMessage ||
        plantsErrorMessage ||
        movementTypesErrorMessage ||
        latestMovementsErrorMessage ||
        latestEventsErrorMessage;

    if (isLoading) {
        return <LoadingScreen message="Cargando unidades..." />;
    }

    return (
        <>
            <section className="mb-5">
                <h2 className="text-2xl font-bold">Unidades</h2>
                <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                    Selecciona una unidad para registrar o consultar movimientos.
                </p>
            </section>

            {!shift && (
                <section className="mb-5 rounded-4xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm text-yellow-200 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
                    No hay turno abierto. Abre un turno para ver el estado operativo de
                    las unidades.
                </section>
            )}

            {errorMessage && (
                <div className="mb-5 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </div>
            )}

            <section className="space-y-4">
                {units.map((unit) => {
                    const latestMovement = latestByUnitId[unit.id] ?? null;
                    const latestEvent = latestMovement
                        ? latestByMovementId[latestMovement.id] ?? null
                        : null;

                    return (
                        <button
                            key={unit.id}
                            type="button"
                            onClick={() =>
                                navigate(`/app/projects/${projectId}/units/${unit.id}`)
                            }
                            className="block w-full text-left"
                        >
                            <UnitCard
                                unit={unit}
                                latestMovement={latestMovement}
                                latestEvent={latestEvent}
                                plants={plants}
                                movementTypes={movementTypes}
                            />
                        </button>
                    );
                })}
            </section>

            {units.length === 0 && !errorMessage && (
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-sm text-slate-400 light:border-slate-200 light:bg-white light:text-slate-500">
                    No hay unidades asignadas.
                </div>
            )}
        </>
    );
}
