import { useMemo } from "react";
import { useLatestUnitMovementEventsByMovementIds } from "../../unit-movement-events/hooks/useLatestUnitMovementEventsByMovementIds";
import { useLatestPlantChecksByShift } from "../../plant-checks/hooks/useLatestPlantChecksByShift";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { useShiftUnitMovements } from "../../unit-movements/hooks/useShiftUnitMovements";
import { useUnits } from "../../units/hooks/useUnits";
import {
  getMovementClosingMetrics,
  getPlantClosingMetrics,
} from "../utils/closing-metrics";

type UseClosingSummaryParams = {
  projectId: string | undefined;
  supervisorId: string | undefined;
  canCloseShift: boolean;
};

export function useClosingSummary({
  projectId,
  supervisorId,
  canCloseShift,
}: UseClosingSummaryParams) {
  const {
    shift,
    isLoading: isLoadingShift,
    errorMessage: shiftErrorMessage,
    closeShift,
  } = useShift(projectId, supervisorId);

  const {
    plants,
    isLoading: isLoadingPlants,
    errorMessage: plantsErrorMessage,
  } = usePlants(projectId);

  const {
    units,
    isLoading: isLoadingUnits,
    errorMessage: unitsErrorMessage,
  } = useUnits(projectId);

  const unitIds = useMemo(() => units.map((unit) => unit.id), [units]);

  const {
    latestByPlantId,
    isLoading: isLoadingPlantChecks,
    errorMessage: plantChecksErrorMessage,
  } = useLatestPlantChecksByShift(shift?.id);

  const {
    unitMovements,
    isLoading: isLoadingUnitMovements,
    errorMessage: unitMovementsErrorMessage,
  } = useShiftUnitMovements(shift?.id, unitIds);

  const {
    latestByMovementId,
    isLoading: isLoadingLatestEvents,
    errorMessage: latestEventsErrorMessage,
  } = useLatestUnitMovementEventsByMovementIds(unitMovements);

  const latestPlantChecks = useMemo(
    () => Object.values(latestByPlantId),
    [latestByPlantId],
  );

  const plantMetrics = useMemo(
    () =>
      getPlantClosingMetrics({
        latestChecks: latestPlantChecks,
        totalPlants: plants.length,
      }),
    [latestPlantChecks, plants.length],
  );

  const movementMetrics = useMemo(
    () =>
      getMovementClosingMetrics({
        unitMovements,
        latestByMovementId,
      }),
    [latestByMovementId, unitMovements],
  );

  const canSubmitClose = Boolean(shift) && canCloseShift;

  const isLoading =
    isLoadingShift ||
    Boolean(
      shift &&
        (isLoadingPlants ||
          isLoadingUnits ||
          isLoadingPlantChecks ||
          isLoadingUnitMovements ||
          isLoadingLatestEvents),
    );

  const errorMessage =
    shiftErrorMessage ||
    plantsErrorMessage ||
    unitsErrorMessage ||
    plantChecksErrorMessage ||
    unitMovementsErrorMessage ||
    latestEventsErrorMessage;

  return {
    shift,
    plants,
    units,
    latestByMovementId,
    plantMetrics,
    movementMetrics,
    canCloseShift,
    canSubmitClose,
    isLoading,
    errorMessage,
    closeShift,
  };
}
