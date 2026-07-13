import { AlertTriangle, Clock3 } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import type { Plant } from "../../plants/types/plant.types";
import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";
import {
  formatElapsedTime,
  getCurrentUnitMovementStatusLabel,
  getUnitLabel,
} from "../../unit-movements/utils/unit-movement-formatters";
import type { Unit } from "../../units/types/unit.types";

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
  const hasOpenMovements = openMovements.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[calc(100dvh-3rem)] w-full max-w-xl overflow-y-auto overscroll-contain rounded-4xl border border-white/10 bg-slate-950 p-5 shadow-2xl light:border-slate-200 light:bg-white">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-200 light:bg-yellow-50 light:text-yellow-700">
            <AlertTriangle size={22} />
          </div>

          <div>
            <h3 className="text-lg font-bold">Confirmar cierre de turno</h3>

            <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
              Se guardará la evidencia del turno y ya no se aceptarán nuevos
              registros dentro de este turno.
            </p>
          </div>
        </div>

        {hasOpenMovements ? (
          <div className="mt-4 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-4 light:border-yellow-200 light:bg-yellow-50">
            <p className="text-sm font-semibold text-yellow-200 light:text-yellow-700">
              El turno cerrará con {openMovements.length} movimiento(s)
              abierto(s). No se cancelan ni se cierran; quedan heredables para
              continuar en el siguiente turno.
            </p>

            <div className="mt-3 space-y-2">
              {openMovements.map((movement) => {
                const latestEvent = latestByMovementId[movement.id];
                const unitLabel = getUnitLabel(units, movement.unitId);
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
                const statusLabel = getCurrentUnitMovementStatusLabel({
                  movement,
                  latestEvent,
                  openFallbackLabel: "Movimiento abierto",
                });

                return (
                  <div
                    key={movement.id}
                    className="rounded-2xl bg-slate-950/40 p-3 text-sm light:bg-white"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{unitLabel}</p>

                        <p className="text-slate-400 light:text-slate-500">
                          {originName} → {destinationName}
                        </p>
                      </div>

                      <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-200 light:bg-yellow-100 light:text-yellow-700">
                        {statusLabel}
                      </span>
                    </div>

                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 light:text-slate-500">
                      <Clock3 size={14} />
                      Activo: {formatElapsedTime(movement.startedAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-3xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300 light:bg-emerald-50 light:text-emerald-700">
            No hay movimientos abiertos para heredar al siguiente turno.
          </p>
        )}

        <div className="sticky bottom-0 mt-5 grid grid-cols-2 gap-3 bg-slate-950 pt-3 light:bg-white">
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
