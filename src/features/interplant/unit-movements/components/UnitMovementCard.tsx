import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash2,
  Clock3,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import { UnitMovementEventActions } from "../../unit-movement-events/components/UnitMovementEventActions";
import { UnitMovementTimeline } from "../../unit-movement-events/components/UnitMovementTimeline";
import { useUnitMovementEvents } from "../../unit-movement-events/hooks/useUnitMovementEvents";
import type { UnitMovementEventAction } from "../../unit-movement-events/types/unit-movement-event-action.types";
import {
  UNIT_MOVEMENT_EVENT_LABELS,
  type UnitMovementEvent,
  type UnitMovementEventType,
} from "../../unit-movement-events/types/unit-movement-event.types";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type {
  MovementType,
  UnitMovement,
} from "../types/unit-movement.types";
import { UNIT_MOVEMENT_STATUS_LABELS } from "../types/unit-movement.types";

type UnitMovementCardProps = {
  movement: UnitMovement;
  units: Unit[];
  plants: Plant[];
  movementTypes: MovementType[];
  mealTargetMinutes: number;
  mealDelayLimitMinutes: number;
  eventActions: UnitMovementEventAction[];
  onComplete: (movementId: string) => Promise<void>;
  onCancel: (movementId: string) => Promise<void>;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function findNameById<T extends { id: string; name: string }>(
  items: T[],
  id: string | null,
  fallback: string,
) {
  if (!id) {
    return fallback;
  }

  return items.find((item) => item.id === id)?.name ?? fallback;
}

function getLatestEventByType(
  events: UnitMovementEvent[],
  eventType: UnitMovementEventType,
) {
  return events.find((event) => event.eventType === eventType) ?? null;
}

function getElapsedMinutes(startDate: string, currentDate: Date) {
  const start = new Date(startDate).getTime();
  const current = currentDate.getTime();

  return Math.max(0, Math.floor((current - start) / 60_000));
}

function formatElapsedMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours} h ${remainingMinutes.toString().padStart(2, "0")} min`;
}

function formatElapsedClock(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
}

export function UnitMovementCard({
  movement,
  units,
  plants,
  movementTypes,
  mealTargetMinutes,
  mealDelayLimitMinutes,
  eventActions,
  onComplete,
  onCancel,
}: UnitMovementCardProps) {
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const {
    unitMovementEvents,
    latestEvent,
    isLoading: isLoadingEvents,
    errorMessage: eventsErrorMessage,
    addUnitMovementEvent,
  } = useUnitMovementEvents(movement.id);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const unitName = findNameById(units, movement.unitId, "Unidad");
  const originName = findNameById(
    plants,
    movement.originPlantId,
    "Sin origen",
  );
  const destinationName = findNameById(
    plants,
    movement.destinationPlantId,
    "Sin destino",
  );
  const movementTypeName = findNameById(
    movementTypes,
    movement.movementTypeId,
    "Movimiento",
  );

  const isOpen = movement.status === "open";
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
  const elapsedMovementMinutes = getElapsedMinutes(movement.startedAt, now);
  const isMealDelayed = elapsedMealMinutes > mealDelayLimitMinutes;

  const currentStatusLabel = isMealActive
    ? "Comida"
    : movement.status === "open" && latestEvent
      ? UNIT_MOVEMENT_EVENT_LABELS[latestEvent.eventType]
      : UNIT_MOVEMENT_STATUS_LABELS[movement.status];

  const activeEventType = isMealActive
    ? "meal"
    : latestEvent?.eventType ?? null;

  const handleCreateEvent = async (eventType: UnitMovementEventType) => {
    try {
      setIsEventSubmitting(true);

      await addUnitMovementEvent({
        unitMovementId: movement.id,
        eventType,
      });

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
        notes: "Hora de comida finalizada.",
      });

      toast.success("Hora de comida finalizada.");
    } catch {
      toast.error("No se pudo finalizar la comida.");
    } finally {
      setIsEventSubmitting(false);
    }
  };

  return (
    <article
      className={`rounded-sm border bg-panel p-4 light:bg-white ${
        isMealDelayed
          ? "border-principal shadow-[0_0_0_1px_rgba(232,163,61,0.25)]"
          : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-ibm-plex-mono text-sm text-muted">{unitName}</p>
          <p className="mt-1 font-ibm-plex-mono text-sm text-faint">
            {originName} → {destinationName}
          </p>
        </div>

        <span className="mincard shrink-0 text-xs light:text-slate-900">
          {movementTypeName}
        </span>
      </div>

      <section className="mt-5 rounded-sm border border-line-strong bg-surface-dark px-4 py-5 text-center light:bg-slate-50">
        <p className="section-label justify-center">Estado actual</p>
        <h3
          className={`mt-3 text-3xl font-bold tittle ${
            isMealDelayed ||
            activeEventType === "waiting_dock" ||
            activeEventType === "meal"
              ? "text-principal"
              : "text-foreground-dark light:text-slate-900"
          }`}
        >
          {currentStatusLabel}
        </h3>
        <p className="mt-3 font-ibm-plex-mono text-4xl font-semibold tracking-[0.06em] text-foreground-dark light:text-slate-900">
          {formatElapsedClock(elapsedMovementMinutes)}
        </p>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 font-ibm-plex-mono text-xs text-muted">
        <div className="rounded-sm border border-line bg-surface-dark p-3 light:bg-slate-50">
          <p className="text-faint">Inicio</p>
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
              <p className="font-semibold text-principal">
                Unidad en hora de comida
              </p>
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

      {isOpen && (
        <>
          <UnitMovementEventActions
            actions={eventActions}
            activeEventType={activeEventType}
            disabled={!isOpen || isMealActive}
            isSubmitting={isEventSubmitting}
            onCreateEvent={handleCreateEvent}
          />

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
        </>
      )}

      <UnitMovementTimeline
        events={unitMovementEvents}
        isLoading={isLoadingEvents}
        errorMessage={eventsErrorMessage}
      />

      {isOpen && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isMealActive}
            onClick={() => void onComplete(movement.id)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-success px-4 font-barlow-condensed text-base font-semibold uppercase tracking-[0.08em] text-slate-950 disabled:opacity-50"
          >
            <CheckCircle2 size={17} />
            Completar
          </button>

          <button
            type="button"
            disabled={isMealActive}
            onClick={() => void onCancel(movement.id)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-danger px-4 font-barlow-condensed text-base font-semibold uppercase tracking-[0.08em] text-danger disabled:opacity-50"
          >
            <CircleSlash2 size={17} />
            Cancelar
          </button>
        </div>
      )}

      {isMealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm">
          <section className="max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto rounded-sm border border-line-strong bg-surface-dark p-5 shadow-2xl light:bg-white">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-principal/10 text-principal">
                <Utensils size={21} />
              </div>

              <div>
                <h3 className="text-2xl font-bold tittle">
                  Iniciar hora de comida
                </h3>
                <p className="sub mt-1">
                  Se registrará la comida de {unitName} y se bloquearán los estados normales hasta finalizarla.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-sm border border-principal/30 bg-principal/10 px-4 py-3 text-sm text-principal">
              Tiempo objetivo: {mealTargetMinutes} minutos. Alerta después de{" "}
              {mealDelayLimitMinutes} minutos.
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isEventSubmitting}
                onClick={() => setIsMealModalOpen(false)}
                className="rounded-sm border border-line-strong px-4 py-3 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] text-muted disabled:opacity-50"
              >
                Cancelar
              </button>

              <Button
                type="button"
                disabled={isEventSubmitting}
                onClick={() => void handleStartMeal()}
              >
                {isEventSubmitting ? "Iniciando..." : "Confirmar"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
