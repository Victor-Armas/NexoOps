import type { UnitMovementEventAction } from "../types/unit-movement-event-action.types";
import type { UnitMovementEventType } from "../types/unit-movement-event.types";

type UnitMovementEventActionsProps = {
  actions: UnitMovementEventAction[];
  activeEventType?: UnitMovementEventType | null;
  disabled: boolean;
  isSubmitting: boolean;
  onCreateEvent: (eventType: UnitMovementEventType) => Promise<void>;
};

export function UnitMovementEventActions({
  actions,
  activeEventType,
  disabled,
  isSubmitting,
  onCreateEvent,
}: UnitMovementEventActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="mt-5">
      <p className="section-label before:h-px before:flex-1 before:bg-line">
        Actualizar estado
      </p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {actions.map((action) => {
          const isActive = activeEventType === action.eventType;

          return (
            <button
              key={action.eventType}
              type="button"
              disabled={disabled || isSubmitting}
              onClick={() => void onCreateEvent(action.eventType)}
              className={`min-h-11 shrink-0 rounded-sm border px-4 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.06em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                  ? "border-principal bg-principal text-slate-950"
                  : "border-line-strong bg-transparent text-muted hover:border-principal/60 hover:text-principal"
              }`}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
