import {
  Activity,
  ClipboardList,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../auth/hooks/useAuth";
import { DeleteShiftConfirmModal } from "../components/DeleteShiftConfirmModal";
import { IncidentsHistoryView } from "../components/IncidentsHistoryView";
import { PersonalHistoryView } from "../components/PersonalHistoryView";
import { ShiftClosingHistoryFilters } from "../components/ShiftClosingHistoryFilters";
import { ShiftClosingHistoryList } from "../components/ShiftClosingHistoryList";
import { UnitsHistoryView } from "../components/UnitsHistoryView";
import { useOperationalHistory } from "../hooks/useOperationalHistory";
import { useShiftClosingHistory } from "../hooks/useShiftClosingHistory";
import type { OperationalHistoryView } from "../types/operational-history.types";
import type { ShiftClosingHistoryItem } from "../types/shift-closing-history.types";
import { toHistoryNumber } from "../utils/history-format";

const HISTORY_VIEWS: Array<{
  value: OperationalHistoryView;
  label: string;
}> = [
  { value: "personal", label: "Personal" },
  { value: "unidades", label: "Unidades" },
  { value: "incidencias", label: "Incidencias" },
  { value: "cierres", label: "Cierres" },
];

function isHistoryView(value: string | null): value is OperationalHistoryView {
  return HISTORY_VIEWS.some((view) => view.value === value);
}

export function OperationalHistoryPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [shiftToDelete, setShiftToDelete] =
    useState<ShiftClosingHistoryItem | null>(null);
  const { can } = useAuth();
  const canViewReports = can("reports.view");
  const canDeleteShift = can("shifts.delete");
  const requestedView = searchParams.get("view");
  const activeView: OperationalHistoryView = isHistoryView(requestedView)
    ? requestedView
    : "personal";

  const operationalHistory = useOperationalHistory(
    canViewReports ? projectId : undefined,
  );
  const closingHistory = useShiftClosingHistory(
    canViewReports && activeView === "cierres" ? projectId : undefined,
  );

  const totalActivity = useMemo(
    () =>
      operationalHistory.data.users.reduce(
        (total, user) => total + toHistoryNumber(user.total_activity_count),
        0,
      ),
    [operationalHistory.data.users],
  );

  const handleViewChange = (view: OperationalHistoryView) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("view", view);
    setSearchParams(nextParams, { replace: true });
  };

  const handleDeleteShift = async () => {
    if (!shiftToDelete) return;

    try {
      await closingHistory.deleteShift(shiftToDelete.shiftId);
      await operationalHistory.refetch();
      setShiftToDelete(null);
      toast.success("Turno eliminado permanentemente.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el turno.",
      );
    }
  };

  const isDeletingSelectedShift =
    Boolean(shiftToDelete) &&
    closingHistory.deletingShiftId === shiftToDelete?.shiftId;

  if (!canViewReports) {
    return (
      <section className="rounded-sm border border-danger/30 bg-danger/10 p-5 text-sm text-danger">
        No tienes permiso para consultar el historial operativo.
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-principal/10 text-principal">
            <Activity size={24} />
          </div>
          <div>
            <p className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Supervisión y análisis
            </p>
            <h2 className="mt-1 text-2xl font-bold">Historial operativo</h2>
            <p className="mt-1 text-sm text-muted">
              Consulta quién hizo qué y cómo se distribuyó la operación por turno.
            </p>
          </div>
        </div>

        <div className="mt-5 -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2 border-b border-line pb-3">
            {HISTORY_VIEWS.map((view) => (
              <button
                key={view.value}
                type="button"
                onClick={() => handleViewChange(view.value)}
                className={`h-9 rounded-sm border px-3 font-ibm-plex-mono text-[9px] font-semibold uppercase tracking-[0.08em] ${
                  activeView === view.value
                    ? "border-principal bg-principal text-black"
                    : "border-line-strong bg-panel text-muted"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeView !== "cierres" && (
        <section className="rounded-sm border border-line bg-panel p-4">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-xs font-semibold text-muted">
                Desde
              </span>
              <input
                type="date"
                value={operationalHistory.filters.startDate}
                onChange={(event) =>
                  operationalHistory.setFilters((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-semibold text-muted">
                Hasta
              </span>
              <input
                type="date"
                value={operationalHistory.filters.endDate}
                onChange={(event) =>
                  operationalHistory.setFilters((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={operationalHistory.isLoading}
            onClick={() => void operationalHistory.refetch()}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-principal/40 text-xs font-semibold uppercase tracking-[0.08em] text-principal disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={operationalHistory.isLoading ? "animate-spin" : ""}
            />
            Actualizar información
          </button>
        </section>
      )}

      {operationalHistory.errorMessage && activeView !== "cierres" && (
        <section className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {operationalHistory.errorMessage}
        </section>
      )}

      {activeView !== "cierres" &&
        (operationalHistory.isLoading ? (
          <section className="rounded-sm border border-line bg-panel p-5 text-sm text-muted">
            Cargando historial operativo...
          </section>
        ) : (
          <>
            {activeView === "personal" && (
              <PersonalHistoryView
                users={operationalHistory.data.users}
                plantChecks={operationalHistory.data.plantChecks}
              />
            )}

            {activeView === "unidades" && (
              <UnitsHistoryView
                units={operationalHistory.data.units}
                statusDurations={operationalHistory.data.statusDurations}
              />
            )}

            {activeView === "incidencias" && (
              <IncidentsHistoryView
                incidents={operationalHistory.data.incidents}
                daily={operationalHistory.data.incidentDaily}
              />
            )}
          </>
        ))}

      {activeView === "personal" && !operationalHistory.isLoading && (
        <p className="text-center font-ibm-plex-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          {totalActivity} actividades registradas en el rango
        </p>
      )}

      {activeView === "cierres" && (
        <div className="space-y-5">
          <section className="flex items-center gap-2">
            <ClipboardList size={14} className="text-principal" />
            <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Evidencia de cierres
            </span>
            <div className="h-px flex-1 bg-line" />
          </section>

          <ShiftClosingHistoryFilters
            filters={closingHistory.filters}
            isLoading={closingHistory.isLoading}
            onFiltersChange={closingHistory.setFilters}
            onRefresh={() => void closingHistory.refetch()}
          />

          {closingHistory.errorMessage && (
            <section className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
              {closingHistory.errorMessage}
            </section>
          )}

          {closingHistory.isLoading ? (
            <section className="rounded-sm border border-line bg-panel p-5 text-sm text-muted">
              Cargando cierres...
            </section>
          ) : (
            <ShiftClosingHistoryList
              items={closingHistory.items}
              plantCheckActivity={closingHistory.plantCheckActivity}
              canDeleteShift={canDeleteShift}
              onRequestDelete={setShiftToDelete}
            />
          )}
        </div>
      )}

      {activeView === "incidencias" &&
        operationalHistory.data.incidents.length === 0 &&
        !operationalHistory.isLoading && (
          <section className="rounded-sm border border-line bg-panel p-4 text-sm text-muted">
            <TriangleAlert size={16} className="mb-2 text-principal" />
            No hay incidencias dentro del rango seleccionado.
          </section>
        )}

      <DeleteShiftConfirmModal
        item={shiftToDelete}
        isDeleting={isDeletingSelectedShift}
        onCancel={() => {
          if (!isDeletingSelectedShift) {
            setShiftToDelete(null);
          }
        }}
        onConfirm={() => void handleDeleteShift()}
      />
    </div>
  );
}
