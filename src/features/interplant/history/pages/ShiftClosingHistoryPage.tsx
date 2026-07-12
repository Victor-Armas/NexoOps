import { ClipboardList } from "lucide-react";
import { useParams } from "react-router-dom";
import { ShiftClosingHistoryFilters } from "../components/ShiftClosingHistoryFilters";
import { ShiftClosingHistoryList } from "../components/ShiftClosingHistoryList";
import { useShiftClosingHistory } from "../hooks/useShiftClosingHistory";

export function ShiftClosingHistoryPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const {
        filters,
        items,
        isLoading,
        errorMessage,
        setFilters,
        refetch,
    } = useShiftClosingHistory(projectId);

    return (
        <>
            <section className="mb-5 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <ClipboardList size={24} />
                </div>

                <div>
                    <h2 className="text-2xl font-bold">Historial de cierres</h2>
                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        Consulta evidencia histórica por fecha y tipo de turno.
                    </p>
                </div>
            </section>

            <ShiftClosingHistoryFilters
                filters={filters}
                isLoading={isLoading}
                onFiltersChange={setFilters}
                onRefresh={() => void refetch()}
            />

            {errorMessage && (
                <section className="mt-5 rounded-4xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </section>
            )}

            <section className="mt-5">
                {isLoading ? (
                    <section className="rounded-4xl border border-white/10 bg-white/10 p-5 text-sm text-slate-400 light:border-slate-200 light:bg-white light:text-slate-500">
                        Cargando historial...
                    </section>
                ) : (
                    <ShiftClosingHistoryList items={items} />
                )}
            </section>
        </>
    );
}
