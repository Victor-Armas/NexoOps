import { useState } from "react";
import {
  CheckCircle2,
  CircleSlash2,
  Clock3,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { UnitMovementEventActions } from "../../unit-movement-events/components/UnitMovementEventActions";
import { UnitMovementTimeline } from "../../unit-movement-events/components/UnitMovementTimeline";
import { useUnitMovementEvents } from "../../unit-movement-events/hooks/useUnitMovementEvents";
import {
  UNIT_MOVEMENT_EVENT_LABELS,
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

export function UnitMovementCard({
  movement,
  units,
  plants,
  movementTypes,
  onComplete,
  onCancel,
}: UnitMovementCardProps) {
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);

  const {
    unitMovementEvents,
    latestEvent,
    isLoading: isLoadingEvents,
    errorMessage: eventsErrorMessage,
    addUnitMovementEvent,
  } = useUnitMovementEvents(movement.id);

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

  const currentStatusLabel = latestEvent
    ? UNIT_MOVEMENT_EVENT_LABELS[latestEvent.eventType]
    : UNIT_MOVEMENT_STATUS_LABELS[movement.status];

  const handleCreateEvent = async (
    eventType: UnitMovementEventType,
  ) => {
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

  return (
    <article className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
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

            <span className="shrink-0 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
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

          {isOpen && (
            <UnitMovementEventActions
              disabled={!isOpen}
              isSubmitting={isEventSubmitting}
              onCreateEvent={handleCreateEvent}
            />
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
                onClick={() => void onComplete(movement.id)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
              >
                <CheckCircle2 size={17} />
                Completar
              </button>

              <button
                type="button"
                onClick={() => void onCancel(movement.id)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 light:text-red-600"
              >
                <CircleSlash2 size={17} />
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}