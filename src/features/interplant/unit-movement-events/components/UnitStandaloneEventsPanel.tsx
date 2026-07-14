import {
  Circle,
  Fuel,
  RefreshCw,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../auth/hooks/useAuth";
import type { UnitMovementEventAction } from "../types/unit-movement-event-action.types";
import {
  DIESEL_REFUELING_FINISHED_EVENT,
  DIESEL_REFUELING_STARTED_EVENT,
  type UnitMovementEvent,
  type UnitMovementEventType,
} from "../types/unit-movement-event.types";
import { getStandaloneStatusActions } from "../utils/unit-event-actions";
import { UnitMovementTimeline } from "./UnitMovementTimeline";

type UnitStandaloneEventsPanelProps = {
  unitName: string;
  hasOpenMovement: boolean;
  standaloneEvents: UnitMovementEvent[];
  eventActions: UnitMovementEventAction[];
  isMealActive: boolean;
  isFuelingActive: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onAddEvent: (payload: {
    eventType: UnitMovementEventType;
    notes?: string;
  }) => Promise<unknown>;
};

function StandaloneActionIcon({ iconKey }: { iconKey: string }) {
  if (iconKey === "shield") return <ShieldCheck size={18} />;
  if (iconKey === "refresh") return <RefreshCw size={18} />;
  if (iconKey === "fuel") return <Fuel size={18} />;
  return <Circle size={18} />;
}

function getActionErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

export function UnitStandaloneEventsPanel({
  unitName,
  hasOpenMovement,
  standaloneEvents,
  eventActions,
  isMealActive,
  isFuelingActive,
  isLoading,
  errorMessage,
  onAddEvent,
}: UnitStandaloneEventsPanelProps) {
  const { can } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canCreateEvent = can("units.event.create");
  const standaloneActions = getStandaloneStatusActions(eventActions);
  const latestStandaloneEvent = standaloneEvents[0] ?? null;

  const handleMeal = async () => {
    try {
      setIsSubmitting(true);
      await onAddEvent({
        eventType: isMealActive ? "meal_finished" : "meal",
        notes: isMealActive
          ? "Hora de comida finalizada."
          : "Inicio de hora de comida.",
      });
      toast.success(
        isMealActive ? "Hora de comida finalizada." : "Hora de comida iniciada.",
      );
    } catch (error) {
      toast.error(
        getActionErrorMessage(
          error,
          "No se pudo actualizar la hora de comida.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFueling = async () => {
    const isFinishing = isFuelingActive;

    try {
      setIsSubmitting(true);
      await onAddEvent({
        eventType: isFinishing
          ? DIESEL_REFUELING_FINISHED_EVENT
          : DIESEL_REFUELING_STARTED_EVENT,
        notes: isFinishing
          ? "Carga de diésel finalizada."
          : "Inicio de carga de diésel.",
      });
      toast.success(
        isFinishing
          ? "Carga de diésel finalizada. Unidad disponible."
          : "Carga de diésel iniciada.",
      );
    } catch (error) {
      toast.error(
        getActionErrorMessage(
          error,
          "No se pudo actualizar la carga de diésel.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStandaloneStatus = async (action: UnitMovementEventAction) => {
    try {
      setIsSubmitting(true);
      await onAddEvent({
        eventType: action.eventType,
        notes: `${action.label} registrado.`,
      });
      toast.success(`${action.label} registrado.`);
    } catch (error) {
      toast.error(
        getActionErrorMessage(
          error,
          `No se pudo registrar ${action.label.toLowerCase()}.`,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mb-7 rounded-sm border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label">Eventos de unidad</p>
          <p className="sub mt-2">
            Comida, carga de diésel y estatus independientes no requieren un
            movimiento activo.
          </p>
        </div>
        <span className="mincard shrink-0 text-xs">{unitName}</span>
      </div>

      {hasOpenMovement && (
        <p className="mt-4 rounded-sm border border-line bg-surface-dark px-4 py-3 text-sm text-muted">
          La unidad tiene un movimiento abierto. Registra sus estatus desde los
          controles del movimiento.
        </p>
      )}

      {!hasOpenMovement && canCreateEvent && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isSubmitting || isFuelingActive}
            onClick={() => void handleMeal()}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border px-3 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.07em] disabled:opacity-50 ${
              isMealActive
                ? "border-principal bg-principal text-slate-950"
                : "border-principal/50 text-principal"
            }`}
          >
            <Utensils size={18} />
            {isMealActive ? "Finalizar comida" : "Iniciar comida"}
          </button>

          <button
            type="button"
            disabled={isSubmitting || isMealActive}
            onClick={() => void handleFueling()}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border px-3 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.07em] disabled:opacity-50 ${
              isFuelingActive
                ? "border-principal bg-principal text-slate-950"
                : "border-principal/50 text-principal"
            }`}
          >
            <Fuel size={18} />
            {isFuelingActive ? "Finalizar carga" : "Cargar diésel"}
          </button>

          {standaloneActions.map((action) => {
            const isActive =
              !isMealActive &&
              !isFuelingActive &&
              latestStandaloneEvent?.eventType === action.eventType;

            return (
              <button
                key={action.id}
                type="button"
                disabled={isSubmitting || isMealActive || isFuelingActive}
                onClick={() => void handleStandaloneStatus(action)}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border px-3 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.07em] disabled:opacity-50 ${
                  isActive
                    ? "border-principal bg-principal text-slate-950"
                    : "border-line-strong text-muted"
                }`}
              >
                <StandaloneActionIcon iconKey={action.iconKey} />
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {!hasOpenMovement && !canCreateEvent && (
        <p className="mt-4 text-sm text-muted">
          Tu rol no permite registrar eventos de unidad.
        </p>
      )}

      <UnitMovementTimeline
        events={standaloneEvents}
        eventActions={eventActions}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </section>
  );
}
