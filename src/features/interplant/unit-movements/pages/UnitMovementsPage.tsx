import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { useUnits } from "../../units/hooks/useUnits";
import { UnitMovementForm } from "../components/UnitMovementForm";
import { UnitMovementList } from "../components/UnitMovementList";
import { useMovementTypes } from "../hooks/useMovementTypes";
import { useUnitMovements } from "../hooks/useUnitMovements";
import type { UnitMovementFormValues } from "../schemas/unit-movement.schemas";
import { useOperationalSettings } from "../../operational-settings/hooks/useOperationalSettings";
import { useUnitMovementEventActions } from "../../unit-movement-events/hooks/useUnitMovementEventActions";

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
      <section className="mb-5">
        <Link
          to={`/app/projects/${projectId}/units`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 light:text-cyan-700"
        >
          <ArrowLeft size={16} />
          Volver a unidades
        </Link>

        <h2 className="text-2xl font-bold">
          {unit ? unit.name : "Unidad"}
        </h2>

        <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
          Movimientos registrados durante el turno actual.
        </p>
      </section>

      {!shift && (
        <section className="mb-5 rounded-4xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm text-yellow-200 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
          No hay turno abierto. Abre un turno para registrar movimientos.
        </section>
      )}

      {errorMessage && (
        <section className="mb-5 rounded-4xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
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
        <section className="mb-5 rounded-4xl border border-white/10 bg-white/10 p-5 text-sm text-slate-400 light:border-slate-200 light:bg-white light:text-slate-500">
          Tu rol solo permite consultar movimientos.
        </section>
      )}

      {shift && (
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
      )}
    </>
  );
}
