import { AlertTriangle } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { UNIT_MOVEMENT_EVENT_LABELS } from "../../unit-movement-events/types/unit-movement-event.types";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";

type CloseShiftConfirmationModalProps = {
  openMovements: UnitMovement[];
  units: Unit[];
  plants: Plant[];
  latestByMovementId: Record<string, UnitMovementEvent>;
  isClosing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

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

export function CloseShiftConfirmationModal({
  openMovements,
  units,
  plants,
  latestByMovementId,
  isClosing,
  onCancel,
  onConfirm,
}: CloseShiftConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 px-4 py-5 backdrop-blur-sm sm:items-center">
      <section className="w-full max-w-md rounded-4xl border border-white/10 bg-slate-950 p-5 shadow-2xl light:border-slate-200 light:bg-white">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-200 light:bg-yellow-50 light:text-yellow-700">
            <AlertTriangle size={22} />
          </div>

          <div>
            <h3 className="text-lg font-bold">Confirmar cierre de turno</h3>
            <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
              Se guardará la evidencia del turno y ya no se aceptarán nuevos registros en este turno.
            </p>
          </div>
        </div>

        {openMovements.length > 0 && (
          <div className="mt-4 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-4 light:border-yellow-200 light:bg-yellow-50">
            <p className="text-sm font-semibold text-yellow-200 light:text-yellow-700">
              El turno cerrará con {openMovements.length} movimiento(s) pendiente(s):
            </p>

            <div className="mt-3 space-y-2">
              {openMovements.map((movement) => {
                const latestEvent = latestByMovementId[movement.id];
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
                const statusLabel = latestEvent
                  ? UNIT_MOVEMENT_EVENT_LABELS[latestEvent.eventType]
                  : "Movimiento abierto";

                return (
                  <div
                    key={movement.id}
                    className="rounded-2xl bg-slate-950/40 p-3 text-sm light:bg-white"
                  >
                    <p className="font-semibold">{unitName}</p>
                    <p className="text-slate-400 light:text-slate-500">
                      {originName} → {destinationName}
                    </p>
                    <p className="mt-1 text-xs text-yellow-200 light:text-yellow-700">
                      Estado: {statusLabel}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {openMovements.length === 0 && (
          <p className="mt-4 rounded-3xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300 light:bg-emerald-50 light:text-emerald-700">
            No hay movimientos abiertos registrados en este turno.
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isClosing}
            onClick={onCancel}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200 disabled:opacity-50 light:border-slate-200 light:bg-slate-50 light:text-slate-700"
          >
            Cancelar
          </button>

          <Button type="button" disabled={isClosing} onClick={onConfirm}>
            {isClosing ? "Cerrando..." : "Confirmar cierre"}
          </Button>
        </div>
      </section>
    </div>
  );
}
