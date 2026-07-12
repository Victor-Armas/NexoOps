import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import type { ShiftClosingHistoryItem } from "../types/shift-closing-history.types";

type ShiftClosingHistoryListProps = {
  items: ShiftClosingHistoryItem[];
};

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin dato";
  }

  return dateTimeFormatter.format(new Date(value));
}

export function ShiftClosingHistoryList({
  items,
}: ShiftClosingHistoryListProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-4xl border border-white/10 bg-white/10 p-5 text-sm text-slate-400 light:border-slate-200 light:bg-white light:text-slate-500">
        No hay cierres guardados con los filtros seleccionados.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">
                {SHIFT_TYPE_LABELS[item.shiftType]}
              </h3>
              <p className="text-sm text-slate-400 light:text-slate-500">
                Cerrado: {formatDateTime(item.closedAt)}
              </p>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 light:bg-emerald-50 light:text-emerald-700">
              Cerrado
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-slate-950/40 p-3 light:bg-slate-50">
              <p className="text-xs text-slate-400 light:text-slate-500">
                Plantas revisadas
              </p>
              <p className="mt-1 text-2xl font-bold">
                {item.plantCheckedCount}/{item.plantTotalCount}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-950/40 p-3 light:bg-slate-50">
              <p className="text-xs text-slate-400 light:text-slate-500">
                Riesgo alto
              </p>
              <p className="mt-1 text-2xl font-bold">
                {item.highRiskPlantCount}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-950/40 p-3 light:bg-slate-50">
              <p className="text-xs text-slate-400 light:text-slate-500">
                Llenos / vacíos
              </p>
              <p className="mt-1 text-2xl font-bold">
                {item.fullCount}/{item.emptyCount}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-950/40 p-3 light:bg-slate-50">
              <p className="text-xs text-slate-400 light:text-slate-500">
                Mov. completados
              </p>
              <p className="mt-1 text-2xl font-bold">
                {item.movementCompletedCount}/{item.movementTotalCount}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-300 light:text-slate-700">
            <div className="rounded-2xl bg-slate-950/30 px-2 py-2 light:bg-slate-50">
              Abiertos: {item.movementOpenCount}
            </div>
            <div className="rounded-2xl bg-slate-950/30 px-2 py-2 light:bg-slate-50">
              Cancelados: {item.movementCancelledCount}
            </div>
            <div className="rounded-2xl bg-slate-950/30 px-2 py-2 light:bg-slate-50">
              Cantidad: {item.movementQuantityTotal}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-300 light:text-slate-700">
            <div className="rounded-2xl bg-slate-950/30 px-2 py-2 light:bg-slate-50">
              Incidencias: {item.incidentTotalCount}
            </div>
            <div className="rounded-2xl bg-slate-950/30 px-2 py-2 light:bg-slate-50">
              Abiertas: {item.incidentOpenCount}
            </div>
            <div className="rounded-2xl bg-slate-950/30 px-2 py-2 light:bg-slate-50">
              Altas: {item.incidentHighSeverityCount}
            </div>
          </div>

          {item.notes && (
            <p className="mt-4 rounded-3xl bg-slate-950/30 p-3 text-sm text-slate-300 light:bg-slate-50 light:text-slate-700">
              {item.notes}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
