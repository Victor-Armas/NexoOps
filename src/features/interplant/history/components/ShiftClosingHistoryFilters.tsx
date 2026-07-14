import { RefreshCw } from "lucide-react";
import type { ShiftClosingHistoryFilters } from "../types/shift-closing-history.types";

const SHIFT_TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "morning", label: "Mañana" },
  { value: "afternoon", label: "Tarde" },
  { value: "night", label: "Noche" },
];

type ShiftClosingHistoryFiltersProps = {
  filters: ShiftClosingHistoryFilters;
  isLoading: boolean;
  onFiltersChange: (filters: ShiftClosingHistoryFilters) => void;
  onRefresh: () => void;
};

export function ShiftClosingHistoryFilters({
  filters,
  isLoading,
  onFiltersChange,
  onRefresh,
}: ShiftClosingHistoryFiltersProps) {
  return (
    <section className="min-w-0 rounded-sm border border-line bg-panel p-4">
      <div className="grid min-w-0 gap-3">
        <div className="grid min-w-0 grid-cols-2 gap-3">
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-semibold text-muted">
              Desde
            </span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  startDate: event.target.value,
                })
              }
              className="block h-11 min-w-0 max-w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal"
            />
          </label>

          <label className="min-w-0">
            <span className="mb-2 block text-xs font-semibold text-muted">
              Hasta
            </span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  endDate: event.target.value,
                })
              }
              className="block h-11 min-w-0 max-w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal"
            />
          </label>
        </div>

        <label className="min-w-0">
          <span className="mb-2 block text-xs font-semibold text-muted">
            Turno
          </span>
          <select
            value={filters.shiftType}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                shiftType:
                  event.target.value as ShiftClosingHistoryFilters["shiftType"],
              })
            }
            className="h-11 w-full min-w-0 rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal"
          >
            {SHIFT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={isLoading}
          onClick={onRefresh}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-principal/50 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] text-principal transition hover:bg-principal/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          Actualizar historial
        </button>
      </div>
    </section>
  );
}
