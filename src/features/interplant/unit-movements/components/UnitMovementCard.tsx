import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CircleSlash2,
  Clock3,
  MapPin,
  Route,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { UnitMovementTimeline } from "../../unit-movement-events/components/UnitMovementTimeline";
import { useUnitMovementEvents } from "../../unit-movement-events/hooks/useUnitMovementEvents";
import type { UnitMovementEventAction } from "../../unit-movement-events/types/unit-movement-event-action.types";
import type {
  UnitMovementEvent,
  UnitMovementEventType,
  UnitOperationalPhase,
} from "../../unit-movement-events/types/unit-movement-event.types";
import { getUnitEventLabel } from "../../unit-movement-events/utils/unit-event-actions";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import {
  getLatestCoreUnitMovementEvent,
  getNextGuidedUnitMovementAction,
  isCoreUnitMovementWorkflowEventType,
} from "../utils/unit-movement-workflow";
import { resolveUnitOperationalSnapshot } from "../utils/unit-operational-snapshot";
import type {
  ContinueUnitMovementPayload,
  MovementType,
  UnitMovement,
} from "../types/unit-movement.types";
import { UnitMovementContinuationPanel } from "./UnitMovementContinuationPanel";

type AdvanceMovementPayload = {
  movementId: string;
  eventType: string;
  notes?: string;
  phase?: UnitOperationalPhase | null;
  plantId?: string | null;
};

type UnitMovementCardProps = {
  movement: UnitMovement;
  currentShiftId: string;
  units: Unit[];
  plants: Plant[];
  movementTypes: MovementType[];
  mealTargetMinutes: number;
  mealDelayLimitMinutes: number;
  dockWaitLimitMinutes: number;
  documentationWaitLimitMinutes: number;
  eventActions: UnitMovementEventAction[];
  onAdvance: (payload: AdvanceMovementPayload) => Promise<void>;
  onComplete: (movementId: string) => Promise<void>;
  onCompleteAndContinue: (
    payload: ContinueUnitMovementPayload,
  ) => Promise<void>;
  onCancel: (movementId: string) => Promise<void>;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getElapsedMinutes(startDate: string, currentDate: Date) {
  return Math.max(
    0,
    Math.floor((currentDate.getTime() - new Date(startDate).getTime()) / 60_000),
  );
}

function formatElapsedMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  return `${hours} h ${remainingMinutes.toString().padStart(2, "0")} min`;
}

function getLatestEventByType(
  events: UnitMovementEvent[],
  eventType: UnitMovementEventType,
) {
  return events.find((event) => event.eventType === eventType) ?? null;
}

export function UnitMovementCard({
  movement,
  currentShiftId,
  units,
  plants,
  movementTypes,
  mealTargetMinutes,
  mealDelayLimitMinutes,
  dockWaitLimitMinutes,
  documentationWaitLimitMinutes,
  eventActions,
  onAdvance,
  onComplete,
  onCompleteAndContinue,
  onCancel,
}: UnitMovementCardProps) {
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [showContinuation, setShowContinuation] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const {
    unitMovementEvents,
    latestEvent,
    isLoading: isLoadingEvents,
    errorMessage: eventsErrorMessage,
    addUnitMovementEvent,
    refetch,
  } = useUnitMovementEvents(movement.id);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const unit = units.find((item) => item.id === movement.unitId) ?? null;
  const latestCoreEvent = getLatestCoreUnitMovementEvent(unitMovementEvents);
  const nextAction = getNextGuidedUnitMovementAction(latestCoreEvent);

  const latestMealStart = getLatestEventByType(unitMovementEvents, "meal");
  const latestMealFinished = getLatestEventByType(
    unitMovementEvents,
    "meal_finished",
  );
  const isMealActive =
    Boolean(latestMealStart) &&
    (!latestMealFinished ||
      new Date(latestMealStart?.eventAt ?? 0).getTime() >
        new Date(latestMealFinished.eventAt).getTime());
  const elapsedMealMinutes =
    latestMealStart && isMealActive
      ? getElapsedMinutes(latestMealStart.eventAt, now)
      : 0;
  const isMealDelayed = elapsedMealMinutes > mealDelayLimitMinutes;

  const exceptionActions = useMemo(
    () =>
      eventActions.filter(
        (action) =>
          action.isActive &&
          action.showAsAction &&
          action.requiresMovement &&
          action.behavior === "status" &&
          !isCoreUnitMovementWorkflowEventType(action.eventType),
      ),
    [eventActions],
  );

  if (!unit) return null;

  const snapshot = resolveUnitOperationalSnapshot({
    unit,
    movement,
    event: latestEvent,
    eventActions,
    plants,
    movementTypes,
  });
  const statusElapsedMinutes = snapshot.statusStartedAt
    ? getElapsedMinutes(snapshot.statusStartedAt, now)
    : 0;
  const waitLimitMinutes =
    snapshot.waitKind === "dock"
      ? dockWaitLimitMinutes
      : snapshot.waitKind === "documentation"
        ? documentationWaitLimitMinutes
        : null;
  const isWaitDelayed =
    waitLimitMinutes !== null && statusElapsedMinutes > waitLimitMinutes;
  const shouldShowContinuation =
    showContinuation || latestCoreEvent?.eventType === "unloading_finished";

  const handleAdvance = async (
    eventType: string,
    options?: { phase?: UnitOperationalPhase | null; plantId?: string | null },
  ) => {
    try {
      setIsEventSubmitting(true);
      await onAdvance({
        movementId: movement.id,
        eventType,
        phase: options?.phase,
        plantId: options?.plantId,
      });
      await refetch();
      setNow(new Date());
      toast.success("Estado actualizado.");
    } catch {
      toast.error("No se pudo actualizar el estado.");
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const handleStartMeal = async () => {
    try {
      setIsEventSubmitting(true);
      await addUnitMovementEvent({
        unitMovementId: movement.id,
        eventType: "meal",
        phase: snapshot.phase,
        plantId: snapshot.currentPlantId,
        notes: "Inicio de hora de comida.",
      });
      setNow(new Date());
      setIsMealModalOpen(false);
      toast.success("Hora de comida iniciada.");
    } catch {
      toast.error("No se pudo iniciar la comida.");
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const handleFinishMeal = async () => {
    try {
      setIsEventSubmitting(true);
      await addUnitMovementEvent({
        unitMovementId: movement.id,
        eventType: "meal_finished",
        phase: snapshot.phase,
        plantId: snapshot.currentPlantId,
        notes: "Hora de comida finalizada.",
      });
      toast.success("Hora de comida finalizada.");
    } catch {
      toast.error("No se pudo finalizar la comida.");
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const handleLeaveAvailable = async () => {
    try {
      setIsEventSubmitting(true);
      await onComplete(movement.id);
      toast.success("Movimiento completado. La unidad quedó disponible.");
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const handleContinue = async (values: {
    destinationPlantId: string;
    movementTypeId: string;
    quantity: number;
    notes?: string;
  }) => {
    try {
      setIsEventSubmitting(true);
      await onCompleteAndContinue({
        movementId: movement.id,
        shiftId: currentShiftId,
        ...values,
      });
      toast.success("Movimiento completado y siguiente carga iniciada.");
    } finally {
      setIsEventSubmitting(false);
    }
  };

  return (
    <article className="rounded-sm border border-line bg-panel p-4 light:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mincard border-principal text-principal">
              {snapshot.unitLabel}
            </span>
            <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              {snapshot.phaseLabel}
            </span>
          </div>
          <p className="mt-3 font-ibm-plex-mono text-sm text-muted">
            {snapshot.routeLabel}
          </p>
        </div>

        {snapshot.movementTypeLabel && (
          <span className="mincard shrink-0 text-xs light:text-slate-900">
            {snapshot.movementTypeLabel}
          </span>
        )}
      </div>

      <section
        className={`mt-5 rounded-sm border px-4 py-5 ${
          isWaitDelayed || isMealDelayed
            ? "border-principal bg-principal/10"
            : "border-line-strong bg-surface-dark light:bg-slate-50"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="section-label">Estado actual</p>
            <h3 className="mt-2 text-2xl font-bold tittle">
              {isMealActive ? "Comida" : snapshot.headline}
            </h3>
            <p className="mt-2 inline-flex items-center gap-2 font-ibm-plex-mono text-xs text-muted">
              {snapshot.currentPlantCode ? <MapPin size={14} /> : <Clock3 size={14} />}
              {isMealActive && latestMealStart
                ? `Desde ${formatTime(latestMealStart.eventAt)}`
                : snapshot.statusStartedAt
                  ? `Estado actual · ${formatElapsedMinutes(statusElapsedMinutes)}`
                  : "Sin tiempo registrado"}
            </p>
          </div>

          <p className="shrink-0 font-ibm-plex-mono text-xl font-semibold">
            {isMealActive
              ? formatElapsedMinutes(elapsedMealMinutes)
              : formatElapsedMinutes(statusElapsedMinutes)}
          </p>
        </div>

        {isWaitDelayed && waitLimitMinutes !== null && (
          <div className="mt-4 flex items-start gap-2 border-t border-principal/30 pt-3 text-sm text-principal">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            <p>
              Supera el límite de {waitLimitMinutes} min por{" "}
              {statusElapsedMinutes - waitLimitMinutes} min.
            </p>
          </div>
        )}
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 font-ibm-plex-mono text-xs text-muted">
        <div className="rounded-sm border border-line bg-surface-dark p-3 light:bg-slate-50">
          <p className="text-faint">Inicio movimiento</p>
          <p className="mt-1 text-sm text-foreground-dark light:text-slate-900">
            {formatTime(movement.startedAt)}
          </p>
        </div>
        <div className="rounded-sm border border-line bg-surface-dark p-3 light:bg-slate-50">
          <p className="text-faint">Cantidad</p>
          <p className="mt-1 text-sm text-foreground-dark light:text-slate-900">
            {movement.quantity}
          </p>
        </div>
      </div>

      {movement.notes && (
        <p className="mt-4 border-l-2 border-principal pl-3 text-sm text-muted light:text-slate-600">
          {movement.notes}
        </p>
      )}

      {isMealActive && latestMealStart && (
        <section className="mt-4 rounded-sm border border-principal/30 bg-principal/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={19} className="shrink-0 text-principal" />
            <div>
              <p className="font-semibold text-principal">Unidad en hora de comida</p>
              <p className="sub mt-1">
                Inicio {formatTime(latestMealStart.eventAt)} ·{" "}
                {formatElapsedMinutes(elapsedMealMinutes)}
              </p>
              {isMealDelayed && (
                <p className="mt-2 text-sm font-semibold text-principal">
                  Excede el límite de {mealDelayLimitMinutes} minutos.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {!shouldShowContinuation && nextAction && (
        <section className="mt-5 border-t border-line pt-5">
          <p className="section-label text-principal">Siguiente paso</p>
          <p className="sub mt-1">{nextAction.description}</p>
          <button
            type="button"
            disabled={isEventSubmitting || isMealActive}
            onClick={() => {
              if (nextAction.completesMovement) {
                setShowContinuation(true);
                return;
              }

              if (nextAction.eventType) {
                void handleAdvance(nextAction.eventType);
              }
            }}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-principal px-4 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] text-slate-950 transition active:scale-[0.98] disabled:opacity-50"
          >
            {nextAction.label}
            <ArrowRight size={17} />
          </button>

          {latestCoreEvent?.eventType === "in_transit" && (
            <button
              type="button"
              disabled={isEventSubmitting || isMealActive}
              onClick={() => void handleAdvance("positioned")}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-line-strong px-4 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.08em] text-muted transition hover:border-principal/50 hover:text-principal disabled:opacity-50"
            >
              Llegó directo a rampa
            </button>
          )}
        </section>
      )}

      {shouldShowContinuation && (
        <UnitMovementContinuationPanel
          unitLabel={snapshot.unitLabel}
          originPlantId={movement.destinationPlantId}
          plants={plants}
          movementTypes={movementTypes}
          isSubmitting={isEventSubmitting}
          onLeaveAvailable={handleLeaveAvailable}
          onContinue={handleContinue}
        />
      )}

      {exceptionActions.length > 0 && !shouldShowContinuation && (
        <section className="mt-5 border-t border-line pt-4">
          <p className="section-label">Otra situación</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {exceptionActions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={
                  isEventSubmitting ||
                  isMealActive ||
                  latestEvent?.eventType === action.eventType
                }
                onClick={() =>
                  void handleAdvance(action.eventType, {
                    phase: snapshot.phase,
                    plantId: snapshot.currentPlantId,
                  })
                }
                className="min-h-11 shrink-0 rounded-sm border border-line-strong px-4 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.06em] text-muted transition hover:border-principal/60 hover:text-principal disabled:opacity-50"
              >
                {getUnitEventLabel(eventActions, action.eventType)}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-5 border-t border-line pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-label">Hora de comida</p>
            <p className="sub mt-1">
              Objetivo {mealTargetMinutes} min · alerta {mealDelayLimitMinutes} min
            </p>
          </div>

          <button
            type="button"
            disabled={isEventSubmitting}
            onClick={() =>
              isMealActive
                ? void handleFinishMeal()
                : setIsMealModalOpen(true)
            }
            className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm border px-3 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.06em] disabled:opacity-50 ${
              isMealActive
                ? "border-principal bg-principal text-slate-950"
                : "border-principal/50 text-principal"
            }`}
          >
            <Utensils size={16} />
            {isMealActive ? "Finalizar" : "Iniciar"}
          </button>
        </div>
      </section>

      <UnitMovementTimeline
        events={unitMovementEvents}
        isLoading={isLoadingEvents}
        errorMessage={eventsErrorMessage}
      />

      <button
        type="button"
        disabled={isEventSubmitting || isMealActive}
        onClick={() => void onCancel(movement.id)}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-danger/60 px-4 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.08em] text-danger transition hover:bg-danger/10 disabled:opacity-50"
      >
        <CircleSlash2 size={16} />
        Cancelar movimiento
      </button>

      {isMealModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Cerrar confirmación"
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              onClick={() => setIsMealModalOpen(false)}
            />
            <section className="relative z-10 w-full max-w-sm rounded-sm border border-line-strong bg-surface-dark p-5 shadow-2xl light:bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label text-principal">Hora de comida</p>
                  <h4 className="mt-2 text-xl font-bold tittle">
                    Iniciar comida de {snapshot.unitLabel}
                  </h4>
                  <p className="sub mt-2">
                    El flujo del movimiento quedará pausado hasta finalizar la comida.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMealModalOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line text-muted"
                >
                  <X size={17} />
                </button>
              </div>

              <button
                type="button"
                disabled={isEventSubmitting}
                onClick={() => void handleStartMeal()}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-principal px-4 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] text-slate-950 disabled:opacity-50"
              >
                <Utensils size={17} />
                Iniciar hora de comida
              </button>
            </section>
          </div>,
          document.body,
        )}
    </article>
  );
}
