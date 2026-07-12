import type { ShiftClosingHistoryFilters } from "../types/shift-closing-history.types";

const SHIFT_TYPE_OPTIONS = [
    {
        value: "all",
        label: "Todos",
    },
    {
        value: "morning",
        label: "Mañana",
    },
    {
        value: "afternoon",
        label: "Tarde",
    },
    {
        value: "night",
        label: "Noche",
    },
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
        <section className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
            <div className="grid gap-3">
                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
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
                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
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
                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                        Turno
                    </span>

                    <select
                        value={filters.shiftType}
                        onChange={(event) =>
                            onFiltersChange({
                                ...filters,
                                shiftType: event.target
                                    .value as ShiftClosingHistoryFilters["shiftType"],
                            })
                        }
                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 light:border-slate-200 light:bg-white"
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
                    className="h-11 rounded-2xl bg-cyan-400 px-4 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Actualizar historial
                </button>
            </div>
        </section>
    );
}
