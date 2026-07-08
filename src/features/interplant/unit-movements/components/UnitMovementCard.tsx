import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash2,
  Clock3,
  Truck,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import { UnitMovementEventActions } from "../../unit-movement-events/components/UnitMovementEventActions";
import { UnitMovementTimeline } from "../../unit-movement-events/components/UnitMovementTimeline";
import { useUnitMovementEvents } from "../../unit-movement-events/hooks/useUnitMovementEvents";
import {
  UNIT_MOVEMENT_EVENT_LABELS,
  type UnitMovementEventType,
} from "../../unit-movement-events/types/unit-movement-event.types";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type {
  MovementType,
  UnitMovement,
} from "../types/unit-movement.types";
import { UNIT_MOVEMENT_STATUS_LABELS } from "../types/unit-movement.types";

const MEAL_TARGET_MINUTES = 60;
const MEAL_DELAY_LIMIT_MINUTES = 75;

type UnitMovementCardProps = {
  movement: UnitMovement;
  units: Unit[];
  plants: Plant[];
  movementTypes: MovementType[];
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

export function UnitMovementCard({
  movement,
  units,
  plants,
  movementTypes,
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

  const isMealDelayed = elapsedMealMinutes > MEAL_DELAY_LIMIT_MINUTES;

  const currentStatusLabel = isMealActive
    ? "Comida"
    : movement.status === "open" && latestEvent
      ? UNIT_MOVEMENT_EVENT_LABELS[latestEvent.eventType]
      : UNIT_MOVEMENT_STATUS_LABELS[movement.status];

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
      className={`rounded-4xl border p-5 shadow-xl backdrop-blur-xl light:bg-white ${isMealDelayed
          ? "animate-pulse border-yellow-400/50 bg-yellow-400/10 light:border-yellow-300 light:bg-yellow-50"
          : "border-white/10 bg-white/10 light:border-slate-200"
        }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
          <Truck size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold">{unitName}</h3>

              <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                {originName} → {destinationName}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${isMealDelayed
                  ? "bg-yellow-400/20 text-yellow-200 light:bg-yellow-100 light:text-yellow-700"
                  : "bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700"
                }`}
            >
              {currentStatusLabel}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-slate-950/40 p-3 light:bg-slate-50">
              <p className="text-xs text-slate-400">Tipo</p>
              <p className="font-semibold">{movementTypeName}</p>
            </div>

            <div className="rounded-2xl bg-slate-950/40 p-3 light:bg-slate-50">
              <p className="text-xs text-slate-400">Cantidad</p>
              <p className="font-semibold">{movement.quantity}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 light:text-slate-500">
            <Clock3 size={14} />
            <span>Inicio: {formatTime(movement.startedAt)}</span>
          </div>

          {movement.notes && (
            <p className="mt-3 text-sm text-slate-300 light:text-slate-600">
              {movement.notes}
            </p>
          )}

          {isMealActive && latestMealStart && (
            <section className="mt-4 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-4 light:border-yellow-200 light:bg-yellow-50">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="shrink-0 text-yellow-200 light:text-yellow-700"
                />

                <div>
                  <p className="text-sm font-bold text-yellow-100 light:text-yellow-800">
                    Unidad en hora de comida
                  </p>

                  <p className="mt-1 text-sm text-yellow-100/80 light:text-yellow-700">
                    Inicio: {formatTime(latestMealStart.eventAt)} · Tiempo:
                    {" "}
                    {formatElapsedMinutes(elapsedMealMinutes)}
                  </p>

                  {isMealDelayed && (
                    <p className="mt-2 text-sm font-semibold text-yellow-100 light:text-yellow-800">
                      Excede el límite de {MEAL_DELAY_LIMIT_MINUTES} minutos.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {isOpen && (
            <>
              <UnitMovementEventActions
                disabled={!isOpen || isMealActive}
                isSubmitting={isEventSubmitting}
                onCreateEvent={handleCreateEvent}
              />

              <section className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
                <h4 className="text-sm font-bold">Hora de comida</h4>

                <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
                  Tiempo objetivo: {MEAL_TARGET_MINUTES} min · Alerta después de{" "}
                  {MEAL_DELAY_LIMIT_MINUTES} min
                </p>

                <button
                  type="button"
                  disabled={isEventSubmitting}
                  onClick={() =>
                    isMealActive
                      ? void handleFinishMeal()
                      : setIsMealModalOpen(true)
                  }
                  className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${isMealActive
                      ? "bg-yellow-500 text-white"
                      : "border border-yellow-400/30 bg-yellow-400/10 text-yellow-200 light:text-yellow-700"
                    }`}
                >
                  <Utensils size={17} />
                  {isMealActive ? "Finalizar comida" : "Iniciar comida"}
                </button>
              </section>
            </>
          )}

          <UnitMovementTimeline
            events={unitMovementEvents}
            isLoading={isLoadingEvents}
            errorMessage={eventsErrorMessage}
          />

          {isOpen && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isMealActive}
                onClick={() => void onComplete(movement.id)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={17} />
                Completar
              </button>

              <button
                type="button"
                disabled={isMealActive}
                onClick={() => void onCancel(movement.id)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 disabled:cursor-not-allowed disabled:opacity-50 light:text-red-600"
              >
                <CircleSlash2 size={17} />
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {isMealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 px-4 py-5 backdrop-blur-sm sm:items-center">
          <section className="w-full max-w-md rounded-4xl border border-white/10 bg-slate-950 p-5 shadow-2xl light:border-slate-200 light:bg-white">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-200 light:bg-yellow-50 light:text-yellow-700">
                <Utensils size={22} />
              </div>

              <div>
                <h3 className="text-lg font-bold">Iniciar hora de comida</h3>

                <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                  Se registrará la comida de la unidad {unitName}. Durante la
                  comida se bloquearán los estados normales hasta finalizarla.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100 light:bg-yellow-50 light:text-yellow-700">
              Tiempo objetivo: {MEAL_TARGET_MINUTES} minutos. Se marcará alerta
              si pasa de {MEAL_DELAY_LIMIT_MINUTES} minutos.
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isEventSubmitting}
                onClick={() => setIsMealModalOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200 disabled:opacity-50 light:border-slate-200 light:bg-slate-50 light:text-slate-700"
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