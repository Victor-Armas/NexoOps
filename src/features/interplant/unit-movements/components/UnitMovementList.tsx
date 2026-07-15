import type { UnitMovementEventAction } from "../../unit-movement-events/types/unit-movement-event-action.types";
import type { UnitOperationalPhase } from "../../unit-movement-events/types/unit-movement-event.types";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type {
  ContinueUnitMovementPayload,
  MovementType,
  UnitMovement,
} from "../types/unit-movement.types";
import { CompletedUnitMovementCard } from "./CompletedUnitMovementCard";
import { UnitMovementCard } from "./UnitMovementCard";

type UnitMovementListProps = {
  unitMovements: UnitMovement[];
  currentShiftId: string;
  units: Unit[];
  plants: Plant[];
  movementTypes: MovementType[];
  mealTargetMinutes: number;
  mealDelayLimitMinutes: number;
  dockWaitLimitMinutes: number;
  documentationWaitLimitMinutes: number;
  eventActions: UnitMovementEventAction[];
  onAdvance: (payload: {
    movementId: string;
    eventType: string;
    notes?: string;
    phase?: UnitOperationalPhase | null;
    plantId?: string | null;
  }) => Promise<void>;
  onComplete: (movementId: string) => Promise<void>;
  onCompleteAndContinue: (
    payload: ContinueUnitMovementPayload,
  ) => Promise<void>;
  onCancel: (movementId: string) => Promise<void>;
};

export function UnitMovementList({
  unitMovements,
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
}: UnitMovementListProps) {
  const activeMovements = unitMovements.filter(
    (movement) => movement.status === "open",
  );
  const previousMovements = unitMovements.filter(
    (movement) => movement.status !== "open",
  );

  if (unitMovements.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-3">
          <span className="section-label shrink-0">Movimientos</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="mt-4 rounded-sm border border-dashed border-line-strong bg-panel/50 px-5 py-7 text-center light:bg-white">
          <p className="font-medium text-muted">Sin movimientos en este turno</p>
          <p className="sub mt-1">
            Usa el botón + para registrar el primer movimiento de la unidad.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {activeMovements.length > 0 && (
        <div>
          <div className="flex items-center gap-3">
            <span className="section-label shrink-0 text-principal">
              Movimiento actual
            </span>
            <span className="h-px flex-1 bg-principal/30" />
          </div>

          <div className="mt-4 space-y-4">
            {activeMovements.map((movement) => (
              <UnitMovementCard
                key={movement.id}
                movement={movement}
                currentShiftId={currentShiftId}
                units={units}
                plants={plants}
                movementTypes={movementTypes}
                mealTargetMinutes={mealTargetMinutes}
                mealDelayLimitMinutes={mealDelayLimitMinutes}
                dockWaitLimitMinutes={dockWaitLimitMinutes}
                documentationWaitLimitMinutes={documentationWaitLimitMinutes}
                eventActions={eventActions}
                onAdvance={onAdvance}
                onComplete={onComplete}
                onCompleteAndContinue={onCompleteAndContinue}
                onCancel={onCancel}
              />
            ))}
          </div>
        </div>
      )}

      {previousMovements.length > 0 && (
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="section-label shrink-0">Movimientos anteriores</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="mt-3 space-y-2">
            {previousMovements.map((movement) => (
              <CompletedUnitMovementCard
                key={movement.id}
                movement={movement}
                units={units}
                plants={plants}
                movementTypes={movementTypes}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
