import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import type { PlantCheck } from "../../plant-checks/types/plant-check.types";
import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";

export type PlantClosingMetrics = {
  checkedPlants: number;
  totalPlants: number;
  missingPlants: number;
  fullCount: number;
  emptyCount: number;
  pendingCount: number;
  highRiskPlants: number;
};

export type MovementClosingMetrics = {
  openMovements: UnitMovement[];
  completedMovements: UnitMovement[];
  cancelledMovements: UnitMovement[];
  totalMovements: number;
  totalQuantity: number;
  waitingDockCount: number;
  loadingOrUnloadingCount: number;
};

type GetPlantClosingMetricsParams = {
  latestChecks: PlantCheck[];
  totalPlants: number;
};

type GetMovementClosingMetricsParams = {
  unitMovements: UnitMovement[];
  latestByMovementId: Record<string, UnitMovementEvent>;
};

export function getPlantClosingMetrics({
  latestChecks,
  totalPlants,
}: GetPlantClosingMetricsParams): PlantClosingMetrics {
  return {
    checkedPlants: latestChecks.length,
    totalPlants,
    missingPlants: Math.max(totalPlants - latestChecks.length, 0),
    fullCount: latestChecks.reduce(
      (total, plantCheck) => total + plantCheck.fullCount,
      0,
    ),
    emptyCount: latestChecks.reduce(
      (total, plantCheck) => total + plantCheck.emptyCount,
      0,
    ),
    pendingCount: latestChecks.reduce(
      (total, plantCheck) => total + plantCheck.pendingCount,
      0,
    ),
    highRiskPlants: latestChecks.filter(
      (plantCheck) => plantCheck.riskLevel === "high",
    ).length,
  };
}

export function getMovementClosingMetrics({
  unitMovements,
  latestByMovementId,
}: GetMovementClosingMetricsParams): MovementClosingMetrics {
  const openMovements = unitMovements.filter(
    (movement) => movement.status === "open",
  );

  const completedMovements = unitMovements.filter(
    (movement) => movement.status === "completed",
  );

  const cancelledMovements = unitMovements.filter(
    (movement) => movement.status === "cancelled",
  );

  const waitingDockCount = openMovements.filter((movement) => {
    const latestEvent = latestByMovementId[movement.id];

    return latestEvent?.eventType === "waiting_dock";
  }).length;

  const loadingOrUnloadingCount = openMovements.filter((movement) => {
    const latestEvent = latestByMovementId[movement.id];

    return (
      latestEvent?.eventType === "loading" ||
      latestEvent?.eventType === "unloading"
    );
  }).length;

  return {
    openMovements,
    completedMovements,
    cancelledMovements,
    totalMovements: unitMovements.length,
    totalQuantity: unitMovements.reduce(
      (total, movement) => total + movement.quantity,
      0,
    ),
    waitingDockCount,
    loadingOrUnloadingCount,
  };
}
