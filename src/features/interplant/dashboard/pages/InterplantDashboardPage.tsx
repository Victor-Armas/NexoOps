import { useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useIncidents } from "../../incidents/hooks/useIncidents";
import { getIncidentMetrics } from "../../incidents/utils/incident-metrics";
import { useLatestUnitMovementEventsByMovementIds } from "../../unit-movement-events/hooks/useLatestUnitMovementEventsByMovementIds";
import { useLatestPlantChecksByShift } from "../../plant-checks/hooks/useLatestPlantChecksByShift";
import { usePlants } from "../../plants/hooks/usePlants";
import { OpenShiftPanel } from "../../shifts/components/OpenShiftPanel";
import { ShiftStatusBanner } from "../../shifts/components/ShiftStatusBanner";
import type { OpenShiftFormValues } from "../../shifts/schemas/shift.schemas";
import { useShift } from "../../shifts/hooks/useShift";
import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import { useShiftUnitMovements } from "../../unit-movements/hooks/useShiftUnitMovements";
import { useUnits } from "../../units/hooks/useUnits";
import { IncidentKpiGrid } from "../components/IncidentKpiGrid";
import { ShiftKpiGrid } from "../components/ShiftKpiGrid";
import { UnitMovementKpiGrid } from "../components/UnitMovementKpiGrid";

function getPercentage(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
}

export function InterplantDashboardPage() {
  const { profile, can } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    shift,
    isLoading: isLoadingShift,
    errorMessage: shiftErrorMessage,
    openShift,
  } = useShift(projectId, profile?.id);

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
    isLoading: isLoadingLatestChecks,
    errorMessage: latestChecksErrorMessage,
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

  const {
    incidents,
    isLoading: isLoadingIncidents,
    errorMessage: incidentsErrorMessage,
  } = useIncidents(shift?.id);

  const canOpenShift = can("shifts.open");

  const plantMetrics = useMemo(() => {
    const latestChecks = Object.values(latestByPlantId);

    return {
      checkedPlants: latestChecks.length,
      totalPlants: plants.length,
      fullCount: latestChecks.reduce(
        (total, plantCheck) => total + plantCheck.fullCount,
        0,
      ),
      emptyCount: latestChecks.reduce(
        (total, plantCheck) => total + plantCheck.emptyCount,
        0,
      ),
      highRiskPlants: latestChecks.filter(
        (plantCheck) => plantCheck.riskLevel === "high",
      ).length,
    };
  }, [latestByPlantId, plants.length]);

  const unitMetrics = useMemo(() => {
    const openMovements = unitMovements.filter(
      (movement) => movement.status === "open",
    );

    const completedMovements = unitMovements.filter(
      (movement) => movement.status === "completed",
    );

    const activeUnitIds = new Set(
      openMovements.map((movement) => movement.unitId),
    );

    const waitingDockUnits = openMovements.filter((movement) => {
      const latestEvent = latestByMovementId[movement.id];

      return latestEvent?.eventType === "waiting_dock";
    }).length;

    const loadingOrUnloadingUnits = openMovements.filter((movement) => {
      const latestEvent = latestByMovementId[movement.id];

      return (
        latestEvent?.eventType === "loading" ||
        latestEvent?.eventType === "unloading"
      );
    }).length;

    const mealUnits = openMovements.filter((movement) => {
      const latestEvent = latestByMovementId[movement.id];

      return latestEvent?.eventType === "meal";
    }).length;

    return {
      activeUnits: activeUnitIds.size,
      totalUnits: units.length,
      openMovements: openMovements.length,
      completedMovements: completedMovements.length,
      mealUnits,
      waitingDockUnits,
      loadingOrUnloadingUnits,
      totalQuantity: unitMovements.reduce(
        (total, movement) => total + movement.quantity,
        0,
      ),
    };
  }, [latestByMovementId, unitMovements, units.length]);

  const incidentMetrics = useMemo(
    () => getIncidentMetrics(incidents),
    [incidents],
  );

  const plantProgress = getPercentage(
    plantMetrics.checkedPlants,
    plantMetrics.totalPlants,
  );
  const movementProgress = getPercentage(
    unitMetrics.completedMovements,
    unitMetrics.openMovements + unitMetrics.completedMovements,
  );

  const isLoading =
    isLoadingShift ||
    Boolean(
      shift &&
      (isLoadingPlants ||
        isLoadingUnits ||
        isLoadingLatestChecks ||
        isLoadingUnitMovements ||
        isLoadingLatestEvents ||
        isLoadingIncidents),
    );

  const errorMessage =
    shiftErrorMessage ||
    plantsErrorMessage ||
    unitsErrorMessage ||
    latestChecksErrorMessage ||
    unitMovementsErrorMessage ||
    latestEventsErrorMessage ||
    incidentsErrorMessage;

  if (isLoading) {
    return <LoadingScreen message="Cargando turno..." />;
  }

  const handleOpenShift = async (values: OpenShiftFormValues) => {
    try {
      setIsSubmitting(true);
      await openShift(values.shiftType, values.notes?.trim() || undefined);
      toast.success("Turno abierto correctamente.");
    } catch {
      toast.error("No se pudo abrir el turno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section>
        <h2 className="text-2xl font-bold tittle">
          {shift ? SHIFT_TYPE_LABELS[shift.shiftType] : "Sin turno activo"}
        </h2>

        <div className="flex justify-between gap-2 pt-1 text-sm infield light:text-slate-500">
          <p>{profile?.fullName}</p>

          <div className="flex items-center gap-1">
            <UserRound size={16} />
            <p>{profile?.role.name}</p>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div className="mt-5 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </div>
      )}

      {!shift && (
        <div className="mt-5">
          <OpenShiftPanel
            canManage={canOpenShift}
            isSubmitting={isSubmitting}
            onSubmit={handleOpenShift}
          />
        </div>
      )}

      {shift && (
        <>
          <div className="mt-5">
            <ShiftStatusBanner shift={shift} />
          </div>

          <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 light:border-slate-200 light:bg-white">
            <h2 className="font-bold">Resumen visual del turno</h2>
            <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
              Incluye movimientos abiertos heredados de turnos anteriores.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400 light:text-slate-500">
                  <span>Plantas revisadas</span>
                  <span>{plantProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900/60 light:bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-cyan-400"
                    style={{ width: `${plantProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400 light:text-slate-500">
                  <span>Movimientos completados</span>
                  <span>{movementProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900/60 light:bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-400"
                    style={{ width: `${movementProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5">
            <ShiftKpiGrid
              checkedPlants={plantMetrics.checkedPlants}
              totalPlants={plantMetrics.totalPlants}
              fullCount={plantMetrics.fullCount}
              emptyCount={plantMetrics.emptyCount}
              highRiskPlants={plantMetrics.highRiskPlants}
            />
          </div>

          <div className="mt-5">
            <UnitMovementKpiGrid
              activeUnits={unitMetrics.activeUnits}
              totalUnits={unitMetrics.totalUnits}
              openMovements={unitMetrics.openMovements}
              completedMovements={unitMetrics.completedMovements}
              mealUnits={unitMetrics.mealUnits}
              waitingDockUnits={unitMetrics.waitingDockUnits}
              loadingOrUnloadingUnits={unitMetrics.loadingOrUnloadingUnits}
              totalQuantity={unitMetrics.totalQuantity}
            />
          </div>

          <div className="mt-5">
            <IncidentKpiGrid
              totalIncidents={incidentMetrics.totalIncidents}
              openIncidents={incidentMetrics.openIncidents}
              resolvedIncidents={incidentMetrics.resolvedIncidents}
              highSeverityIncidents={incidentMetrics.highSeverityIncidents}
            />
          </div>
        </>
      )}
    </>
  );
}
