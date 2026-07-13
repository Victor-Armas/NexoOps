import { Repeat2, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useUnitEvents } from "../hooks/useUnitEvents";
import { UnitMovementTimeline } from "./UnitMovementTimeline";

type UnitStandaloneEventsPanelProps = {
  unitId: string;
  shiftId: string;
  unitName: string;
  hasOpenMovement: boolean;
  onMealStateChange?: (isMealActive: boolean) => void;
};

export function UnitStandaloneEventsPanel({
  unitId,
  shiftId,
  unitName,
  hasOpenMovement,
  onMealStateChange,
}: UnitStandaloneEventsPanelProps) {
  const { can } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    standaloneEvents,
    isMealActive,
    isLoading,
    errorMessage,
    addEvent,
  } = useUnitEvents(unitId, shiftId);

  useEffect(() => {
    onMealStateChange?.(isMealActive);
  }, [isMealActive, onMealStateChange]);

  const canCreateEvent = can("units.event.create");

  const handleMeal = async () => {
    try {
      setIsSubmitting(true);
      await addEvent({
        eventType: isMealActive ? "meal_finished" : "meal",
        notes: isMealActive
          ? "Hora de comida finalizada."
          : "Inicio de hora de comida.",
      });
      toast.success(
        isMealActive ? "Hora de comida finalizada." : "Hora de comida iniciada.",
      );
    } catch {
      toast.error("No se pudo actualizar la hora de comida.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDriverChange = async () => {
    try {
      setIsSubmitting(true);
      await addEvent({
        eventType: "driver_change",
        notes: "Cambio de operador registrado.",
      });
      toast.success("Cambio de operador registrado.");
    } catch {
      toast.error("No se pudo registrar el cambio de operador.");
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
            Comida y cambio de operador no requieren un movimiento activo.
          </p>
        </div>
        <span className="mincard shrink-0 text-xs">{unitName}</span>
      </div>

      {hasOpenMovement && (
        <p className="mt-4 rounded-sm border border-line bg-surface-dark px-4 py-3 text-sm text-muted">
          La unidad tiene un movimiento abierto. Usa sus controles para registrar
          comida o cambio de operador dentro de ese movimiento.
        </p>
      )}

      {!hasOpenMovement && canCreateEvent && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isSubmitting}
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
            onClick={() => void handleDriverChange()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-line-strong px-3 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.07em] text-muted disabled:opacity-50"
          >
            <Repeat2 size={18} />
            Cambio operador
          </button>
        </div>
      )}

      {!hasOpenMovement && !canCreateEvent && (
        <p className="mt-4 text-sm text-muted">
          Tu rol no permite registrar eventos de unidad.
        </p>
      )}

      <UnitMovementTimeline
        events={standaloneEvents}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </section>
  );
}
