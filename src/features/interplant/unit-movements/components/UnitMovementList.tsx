import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import { UnitMovementCard } from "./UnitMovementCard";
import type {
  MovementType,
  UnitMovement,
} from "../types/unit-movement.types";

type UnitMovementListProps = {
  unitMovements: UnitMovement[];
  units: Unit[];
  plants: Plant[];
  movementTypes: MovementType[];
  onComplete: (movementId: string) => Promise<void>;
  onCancel: (movementId: string) => Promise<void>;
};

export function UnitMovementList({
  unitMovements,
  units,
  plants,
  movementTypes,
  onComplete,
  onCancel,
}: UnitMovementListProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">Movimientos del turno</h2>

      {unitMovements.map((movement) => (
        <UnitMovementCard
          key={movement.id}
          movement={movement}
          units={units}
          plants={plants}
          movementTypes={movementTypes}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      ))}

      {unitMovements.length === 0 && (
        <div className="rounded-4xl border border-white/10 bg-white/10 p-5 text-sm text-slate-400 light:border-slate-200 light:bg-white light:text-slate-500">
          Aún no hay movimientos registrados en este turno.
        </div>
      )}
    </section>
  );
}