import type { UnitMovementEventAction } from "../../unit-movement-events/types/unit-movement-event-action.types";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type {
  MovementType,
  UnitMovement,
} from "../types/unit-movement.types";
import { UnitMovementCard } from "./UnitMovementCard";

type UnitMovementListProps = {
  unitMovements: UnitMovement[];
  units: Unit[];
  plants: Plant[];
  movementTypes: MovementType[];
  mealTargetMinutes: number;
  mealDelayLimitMinutes: number;
  eventActions: UnitMovementEventAction[];
  onComplete: (movementId: string) => Promise<void>;
  onCancel: (movementId: string) => Promise<void>;
};

export function UnitMovementList({
  unitMovements,
  units,
  plants,
  movementTypes,
  mealTargetMinutes,
  mealDelayLimitMinutes,
  eventActions,
  onComplete,
  onCancel,
}: UnitMovementListProps) {
  return (
    <section className="space-y-4">
      <p className="section-label before:h-px before:flex-1 before:bg-line">
        Movimientos del turno
      </p>

      {unitMovements.map((movement) => (
        <UnitMovementCard
          key={movement.id}
          movement={movement}
          units={units}
          plants={plants}
          movementTypes={movementTypes}
          mealTargetMinutes={mealTargetMinutes}
          mealDelayLimitMinutes={mealDelayLimitMinutes}
          eventActions={eventActions}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      ))}

      {unitMovements.length === 0 && (
        <div className="rounded-sm border border-line bg-panel p-5 text-sm text-muted light:border-slate-200 light:bg-white light:text-slate-500">
          Aún no hay movimientos registrados en este turno.
        </div>
      )}
    </section>
  );
}
