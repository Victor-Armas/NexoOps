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

  const unitIds = useMemo(() => units.map((unit) => unit.id), [units]);
  const unitHeading = useMemo(
    () => units.map((unit) => `U${unit.code}`).join(" · "),
    [units],
  );

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
  } = useLatestUnitMovementsByShift(shift?.id, unitIds);

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
      <section className="mb-6">
        <p className="section-label">Unidades</p>
        <h2 className="mt-2 text-4xl font-bold tittle">
          {unitHeading || "Sin unidades"}
        </h2>
        <p className="sub mt-1">Estado en vivo del turno actual</p>
      </section>

      {!shift && (
        <section className="mb-5 rounded-sm border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-200 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
          No hay turno abierto. Abre un turno para ver el estado operativo de las unidades.
        </section>
      )}

      {errorMessage && (
        <div className="mb-5 rounded-sm border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </div>
      )}

      <section className="space-y-3">
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
        <div className="rounded-sm border border-line bg-panel p-5 text-sm text-muted light:border-slate-200 light:bg-white light:text-slate-500">
          No hay unidades asignadas.
        </div>
      )}
    </>
  );
}
