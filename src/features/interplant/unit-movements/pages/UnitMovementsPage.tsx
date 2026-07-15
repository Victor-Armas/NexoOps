import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Plus, Route, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useOperationalSettings } from "../../operational-settings/hooks/useOperationalSettings";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { UnitStandaloneEventsPanel } from "../../unit-movement-events/components/UnitStandaloneEventsPanel";
import { useUnitEvents } from "../../unit-movement-events/hooks/useUnitEvents";
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
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

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

  const {
    standaloneEvents,
    isMealActive: isStandaloneMealActive,
    isFuelingActive,
    isDriverChangeActive,
    isLoading: isLoadingUnitEvents,
    errorMessage: unitEventsErrorMessage,
    addEvent: addStandaloneEvent,
  } = useUnitEvents(unitId, shift?.id);

  const unit = useMemo(
    () => units.find((item) => item.id === unitId) ?? null,
    [units, unitId],
  );

  const hasOpenMovement = useMemo(
    () => unitMovements.some((movement) => movement.status === "open"),
    [unitMovements],
  );

  const canRegisterMovement = can("units.movement.create");
  const canCompleteMovement = can("units.movement.complete");
  const canCancelMovement = can("units.movement.cancel");
  const canCreateMovementNow =
    !hasOpenMovement &&
    !isStandaloneMealActive &&
    !isFuelingActive &&
    !isDriverChangeActive;

  const isLoading =
    isLoadingShift ||
    isLoadingUnits ||
    isLoadingPlants ||
    isLoadingMovementTypes ||
    isLoadingEventActions ||
    Boolean(shift && (isLoadingUnitMovements || isLoadingUnitEvents));

  const errorMessage =
    shiftErrorMessage ||
    unitsErrorMessage ||
    plantsErrorMessage ||
    movementTypesErrorMessage ||
    unitMovementsErrorMessage ||
    unitEventsErrorMessage ||
    eventActionsErrorMessage ||
    operationalSettingsErrorMessage;

  useEffect(() => {
    if (!isMovementModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        setIsMovementModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMovementModalOpen, isSubmitting]);

  if (isLoading) {
    return <LoadingScreen message="Cargando movimientos..." />;
  }

  const handleSubmit = async (
    values: UnitMovementFormValues,
  ): Promise<boolean> => {
    if (!shift || !unitId) {
      toast.error("No hay turno abierto para registrar movimientos.");
      return false;
    }

    if (isStandaloneMealActive) {
      toast.error("Finaliza la comida antes de iniciar un movimiento.");
      return false;
    }

    if (isFuelingActive) {
      toast.error("Finaliza la carga de diésel antes de iniciar un movimiento.");
      return false;
    }

    if (isDriverChangeActive) {
      toast.error("Finaliza el cambio de operador antes de iniciar un movimiento.");
      return false;
    }

    if (hasOpenMovement) {
      toast.error("Completa o cancela el movimiento actual antes de crear otro.");
      return false;
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

      setIsMovementModalOpen(false);
      toast.success("Movimiento registrado correctamente.");
      return true;
    } catch {
      toast.error("No se pudo registrar el movimiento.");
      return false;
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
            <div className="mincard w-fit border-principal text-principal">
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

      {shift && unitId && (
        <UnitStandaloneEventsPanel
          unitName={`U${unit?.code ?? "--"}`}
          hasOpenMovement={hasOpenMovement}
          standaloneEvents={standaloneEvents}
          eventActions={eventActions}
          isMealActive={isStandaloneMealActive}
          isFuelingActive={isFuelingActive}
          isDriverChangeActive={isDriverChangeActive}
          isLoading={isLoadingUnitEvents}
          errorMessage={unitEventsErrorMessage}
          onAddEvent={addStandaloneEvent}
        />
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

      {shift && canRegisterMovement && canCreateMovementNow && (
        <button
          type="button"
          aria-label="Registrar nuevo movimiento"
          onClick={() => setIsMovementModalOpen(true)}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-principal/40 bg-principal text-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition active:scale-90 md:bottom-8 md:right-8"
        >
          <Plus size={27} strokeWidth={2.2} />
        </button>
      )}

      {isMovementModalOpen &&
        canCreateMovementNow &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-movement-title"
          >
            <div
              className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
              aria-hidden="true"
              onMouseDown={() => {
                if (!isSubmitting) {
                  setIsMovementModalOpen(false);
                }
              }}
            />

            <div className="relative z-10 flex min-h-full items-center justify-center p-4 sm:p-6">
              <section className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-sm border border-line-strong bg-surface-dark p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] md:p-6 light:bg-white">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-principal/30 bg-principal/10 text-principal">
                      <Route size={21} />
                    </span>
                    <div className="min-w-0">
                      <p className="section-label text-principal">
                        Nuevo movimiento
                      </p>
                      <h3
                        id="new-movement-title"
                        className="mt-1 text-2xl font-bold tittle"
                      >
                        Registrar movimiento
                      </h3>
                      <p className="sub mt-1">
                        Define la ruta y los datos operativos de U
                        {unit?.code ?? "--"}.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Cerrar"
                    disabled={isSubmitting}
                    onClick={() => setIsMovementModalOpen(false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-line text-muted transition hover:border-principal/50 hover:text-principal disabled:opacity-50"
                  >
                    <X size={19} />
                  </button>
                </div>

                <UnitMovementForm
                  plants={plants}
                  movementTypes={movementTypes}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                />
              </section>
            </div>
          </div>,
          document.body,
        )}

      {shift && !canRegisterMovement && (
        <section className="mb-5 rounded-sm border border-line bg-panel p-5 text-sm text-muted light:border-slate-200 light:bg-white light:text-slate-500">
          Tu rol solo permite consultar movimientos.
        </section>
      )}
    </>
  );
}
