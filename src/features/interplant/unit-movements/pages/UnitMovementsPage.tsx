import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useOperationalSettings } from "../../operational-settings/hooks/useOperationalSettings";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { useUnitMovementEventActions } from "../../unit-movement-events/hooks/useUnitMovementEventActions";
import { useUnits } from "../../units/hooks/useUnits";
import { UnitMovementForm } from "../components/UnitMovementForm";
import { UnitMovementList } from "../components/UnitMovementList";
import { useMovementTypes } from "../hooks/useMovementTypes";
import { useUnitMovements } from "../hooks/useUnitMovements";
import type { UnitMovementFormValues } from "../schemas/unit-movement.schemas";

export function UnitMovementsPage() {
  const { projectId, unitId } = useParams<{
    projectId: string;
    unitId: string;
  }>();

  const { profile, can } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    actions: eventActions,
    isLoading: isLoadingEventActions,
    errorMessage: eventActionsErrorMessage,
  } = useUnitMovementEventActions(projectId);

  const {
    settings: operationalSettings,
    errorMessage: operationalSettingsErrorMessage,
  } = useOperationalSettings(projectId);

  const {
    unitMovements,
    isLoading: isLoadingUnitMovements,
    errorMessage: unitMovementsErrorMessage,
    addUnitMovement,
    markAsCompleted,
    markAsCancelled,
  } = useUnitMovements(shift?.id, unitId);

  const unit = useMemo(
    () => units.find((item) => item.id === unitId) ?? null,
    [units, unitId],
  );

  const canRegisterMovement = can("units.movement.create");
  const canCompleteMovement = can("units.movement.complete");
  const canCancelMovement = can("units.movement.cancel");

  const isLoading =
    isLoadingShift ||
    isLoadingUnits ||
    isLoadingPlants ||
    isLoadingMovementTypes ||
    isLoadingEventActions ||
    Boolean(shift && isLoadingUnitMovements);

  const errorMessage =
    shiftErrorMessage ||
    unitsErrorMessage ||
    plantsErrorMessage ||
    movementTypesErrorMessage ||
    unitMovementsErrorMessage ||
    eventActionsErrorMessage ||
    operationalSettingsErrorMessage;

  if (isLoading) {
    return <LoadingScreen message="Cargando movimientos..." />;
  }

  const handleSubmit = async (values: UnitMovementFormValues) => {
    if (!shift || !unitId) {
      toast.error("No hay turno abierto para registrar movimientos.");
      return;
    }

    try {
      setIsSubmitting(true);

      await addUnitMovement({
        shiftId: shift.id,
        unitId,
        originPlantId: values.originPlantId,
        destinationPlantId: values.destinationPlantId,
        movementTypeId: values.movementTypeId,
        quantity: values.quantity,
        notes: values.notes?.trim() || undefined,
      });

      toast.success("Movimiento registrado correctamente.");
    } catch {
      toast.error("No se pudo registrar el movimiento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (movementId: string) => {
    if (!canCompleteMovement) {
      toast.error("No tienes permiso para completar movimientos.");
      return;
    }

    try {
      await markAsCompleted(movementId);
      toast.success("Movimiento completado.");
    } catch {
      toast.error("No se pudo completar el movimiento.");
    }
  };

  const handleCancel = async (movementId: string) => {
    if (!canCancelMovement) {
      toast.error("No tienes permiso para cancelar movimientos.");
      return;
    }

    try {
      await markAsCancelled(movementId);
      toast.success("Movimiento cancelado.");
    } catch {
      toast.error("No se pudo cancelar el movimiento.");
    }
  };

  return (
    <>
      <section className="mb-6">
        <Link
          to={`/app/projects/${projectId}/units`}
          className="mb-5 inline-flex min-h-11 items-center gap-2 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.14em] text-faint transition hover:text-principal"
        >
          <ChevronLeft size={17} />
          Volver a unidades
        </Link>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="mincard w-fit border-principal text-principal light:text-cyan-700">
              U{unit?.code ?? "--"}
            </div>
            <h2 className="mt-4 text-4xl font-bold tittle">
              {unit?.name ?? "Unidad"}
            </h2>
          </div>

          <p className="sub shrink-0">Movimiento</p>
        </div>
      </section>

      {!shift && (
        <section className="mb-5 rounded-sm border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-200 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
          No hay turno abierto. Abre un turno para registrar movimientos.
        </section>
      )}

      {errorMessage && (
        <section className="mb-5 rounded-sm border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
      )}

      {shift && (
        <div className="mb-7">
          <UnitMovementList
            unitMovements={unitMovements}
            units={units}
            plants={plants}
            movementTypes={movementTypes}
            mealTargetMinutes={operationalSettings?.mealTargetMinutes ?? 60}
            eventActions={eventActions}
            mealDelayLimitMinutes={
              operationalSettings?.mealDelayLimitMinutes ?? 75
            }
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      )}

      {shift && canRegisterMovement && (
        <div className="mb-5">
          <UnitMovementForm
            plants={plants}
            movementTypes={movementTypes}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {shift && !canRegisterMovement && (
        <section className="mb-5 rounded-sm border border-line bg-panel p-5 text-sm text-muted light:border-slate-200 light:bg-white light:text-slate-500">
          Tu rol solo permite consultar movimientos.
        </section>
      )}
    </>
  );
}
