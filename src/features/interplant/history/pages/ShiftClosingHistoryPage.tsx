import {
  Activity,
  ClipboardList,
  RefreshCw,
  TriangleAlert,
  Truck,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../auth/hooks/useAuth";
import { OperationalBarChart } from "../components/OperationalBarChart";
import { ShiftClosingHistoryFilters } from "../components/ShiftClosingHistoryFilters";
import { ShiftClosingHistoryList } from "../components/ShiftClosingHistoryList";
import { useOperationalHistory } from "../hooks/useOperationalHistory";
import { useShiftClosingHistory } from "../hooks/useShiftClosingHistory";
import type {
  IncidentActivityReportRow,
  OperationalHistoryView,
  UnitActivityReportRow,
  UserActivityReportRow,
} from "../types/operational-history.types";

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

function toNumber(value: number | null | undefined) {
  return Number(value ?? 0);
}

function formatDateTime(value: string | null) {
  if (!value) return "Sin actividad";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMinutes(value: number | null | undefined) {
  if (value === null || value === undefined) return "Sin datos";

  const minutes = Number(value);

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours} h ${remainingMinutes} min`;
  }

  return `${Math.round(minutes)} min`;
}

type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
};

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="rounded-sm border border-line bg-panel p-3">
      <p className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-barlow-condensed text-2xl font-bold text-principal">
        {value}
      </p>
      {detail && <p className="mt-1 text-[10px] text-muted">{detail}</p>}
    </article>
  );
}

function PersonalView({ users }: { users: UserActivityReportRow[] }) {
  const [selectedUserId, setSelectedUserId] = useState("all");
  const visibleUsers =
    selectedUserId === "all"
      ? users
      : users.filter((user) => user.user_id === selectedUserId);

  const totals = visibleUsers.reduce(
    (summary, user) => ({
      checks: summary.checks + toNumber(user.plant_check_count),
      events: summary.events + toNumber(user.unit_event_count),
      movements: summary.movements + toNumber(user.movement_count),
      incidents: summary.incidents + toNumber(user.incident_count),
    }),
    { checks: 0, events: 0, movements: 0, incidents: 0 },
  );

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-muted">
          Filtrar por usuario
        </span>
        <select
          value={selectedUserId}
          onChange={(event) => setSelectedUserId(event.target.value)}
          className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
        >
          <option value="all">Todo el personal</option>
          {users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.full_name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Recorridos" value={totals.checks} />
        <MetricCard label="Estatus registrados" value={totals.events} />
        <MetricCard label="Movimientos" value={totals.movements} />
        <MetricCard label="Incidencias" value={totals.incidents} />
      </div>

      <OperationalBarChart
        title="Actividad por usuario"
        items={visibleUsers.map((user) => ({
          id: user.user_id,
          label: user.full_name,
          value: toNumber(user.total_activity_count),
          detail: `${toNumber(user.plant_check_count)} recorridos · ${toNumber(user.unit_event_count)} estatus`,
        }))}
      />

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <UsersRound size={14} className="text-principal" />
          <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Detalle del personal
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {visibleUsers.map((user) => (
          <article
            key={user.user_id}
            className="rounded-sm border border-line bg-panel p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold">{user.full_name}</h3>
                <p className="mt-1 truncate text-xs text-muted">{user.email}</p>
              </div>
              <span className="font-ibm-plex-mono text-lg font-bold text-principal">
                {toNumber(user.total_activity_count)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1 text-center">
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">{toNumber(user.plant_check_count)}</p>
                <p className="mt-1 text-[9px] text-muted">Recorridos</p>
              </div>
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">{toNumber(user.unit_event_count)}</p>
                <p className="mt-1 text-[9px] text-muted">Estatus</p>
              </div>
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">{toNumber(user.movement_count)}</p>
                <p className="mt-1 text-[9px] text-muted">Mov.</p>
              </div>
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">{toNumber(user.incident_count)}</p>
                <p className="mt-1 text-[9px] text-muted">Incid.</p>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-muted">
              Última actividad: {formatDateTime(user.last_activity_at)}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

function UnitsView({
  units,
  statusDurations,
}: {
  units: UnitActivityReportRow[];
  statusDurations: ReturnType<typeof useOperationalHistory>["data"]["statusDurations"];
}) {
  const [selectedUnitId, setSelectedUnitId] = useState("all");
  const visibleUnits =
    selectedUnitId === "all"
      ? units
      : units.filter((unit) => unit.unit_id === selectedUnitId);
  const visibleDurations =
    selectedUnitId === "all"
      ? statusDurations
      : statusDurations.filter((row) => row.unit_id === selectedUnitId);

  const totals = visibleUnits.reduce(
    (summary, unit) => ({
      movements: summary.movements + toNumber(unit.movement_count),
      completed:
        summary.completed + toNumber(unit.completed_movement_count),
      events: summary.events + toNumber(unit.event_count),
      incidents: summary.incidents + toNumber(unit.incident_count),
    }),
    { movements: 0, completed: 0, events: 0, incidents: 0 },
  );

  const averageValues = visibleUnits
    .map((unit) => unit.average_transport_minutes)
    .filter((value): value is number => value !== null)
    .map(Number);
  const averageTransport =
    averageValues.length > 0
      ? averageValues.reduce((sum, value) => sum + value, 0) /
        averageValues.length
      : null;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-muted">
          Filtrar por unidad
        </span>
        <select
          value={selectedUnitId}
          onChange={(event) => setSelectedUnitId(event.target.value)}
          className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
        >
          <option value="all">Todas las unidades</option>
          {units.map((unit) => (
            <option key={unit.unit_id} value={unit.unit_id}>
              {unit.unit_name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Movimientos" value={totals.movements} />
        <MetricCard label="Completados" value={totals.completed} />
        <MetricCard
          label="Traslado promedio"
          value={formatMinutes(averageTransport)}
        />
        <MetricCard label="Incidencias" value={totals.incidents} />
      </div>

      <OperationalBarChart
        title="Movimientos por unidad"
        items={visibleUnits.map((unit) => ({
          id: unit.unit_id,
          label: unit.unit_name,
          value: toNumber(unit.movement_count),
          detail: `${toNumber(unit.completed_movement_count)} completados · ${toNumber(unit.event_count)} estatus`,
        }))}
      />

      <OperationalBarChart
        title="Tiempo promedio por estatus"
        valueSuffix=" min"
        items={visibleDurations
          .slice()
          .sort(
            (first, second) =>
              toNumber(second.average_minutes) - toNumber(first.average_minutes),
          )
          .slice(0, 12)
          .map((row) => ({
            id: `${row.unit_id}-${row.event_type}`,
            label: row.event_label,
            value: toNumber(row.average_minutes),
            detail: `${row.unit_name} · ${toNumber(row.occurrence_count)} registros`,
          }))}
      />

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-principal" />
          <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Detalle de unidades
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {visibleUnits.map((unit) => (
          <article
            key={unit.unit_id}
            className="rounded-sm border border-line bg-panel p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{unit.unit_name}</h3>
                <p className="mt-1 text-xs text-muted">
                  {toNumber(unit.event_count)} cambios de estatus
                </p>
              </div>
              <span className="font-ibm-plex-mono text-lg font-bold text-principal">
                {toNumber(unit.movement_count)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">
                  {toNumber(unit.completed_movement_count)}
                </p>
                <p className="mt-1 text-[9px] text-muted">Completados</p>
              </div>
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">
                  {formatMinutes(unit.average_transport_minutes)}
                </p>
                <p className="mt-1 text-[9px] text-muted">Promedio</p>
              </div>
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">
                  {toNumber(unit.incident_count)}
                </p>
                <p className="mt-1 text-[9px] text-muted">Incidencias</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function IncidentsView({
  incidents,
  daily,
}: {
  incidents: IncidentActivityReportRow[];
  daily: ReturnType<typeof useOperationalHistory>["data"]["incidentDaily"];
}) {
  const [scope, setScope] = useState("all");
  const [categoryId, setCategoryId] = useState("all");

  const scopeFiltered =
    scope === "all"
      ? incidents
      : incidents.filter((incident) => incident.category_scope === scope);
  const visibleIncidents =
    categoryId === "all"
      ? scopeFiltered
      : scopeFiltered.filter(
          (incident) => (incident.category_id ?? "legacy") === categoryId,
        );

  const totals = visibleIncidents.reduce(
    (summary, incident) => ({
      total: summary.total + toNumber(incident.total_count),
      open: summary.open + toNumber(incident.open_count),
      high: summary.high + toNumber(incident.high_count),
      resolutionValues:
        incident.average_resolution_minutes === null
          ? summary.resolutionValues
          : [
              ...summary.resolutionValues,
              Number(incident.average_resolution_minutes),
            ],
    }),
    {
      total: 0,
      open: 0,
      high: 0,
      resolutionValues: [] as number[],
    },
  );
  const averageResolution =
    totals.resolutionValues.length > 0
      ? totals.resolutionValues.reduce((sum, value) => sum + value, 0) /
        totals.resolutionValues.length
      : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="mb-2 block text-xs font-semibold text-muted">
            Tipo
          </span>
          <select
            value={scope}
            onChange={(event) => {
              setScope(event.target.value);
              setCategoryId("all");
            }}
            className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
          >
            <option value="all">Planta y unidad</option>
            <option value="plant">Planta</option>
            <option value="unit">Unidad</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-xs font-semibold text-muted">
            Categoría
          </span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
          >
            <option value="all">Todas</option>
            {scopeFiltered.map((incident) => (
              <option
                key={incident.category_id ?? "legacy"}
                value={incident.category_id ?? "legacy"}
              >
                {incident.category_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Total" value={totals.total} />
        <MetricCard label="Abiertas" value={totals.open} />
        <MetricCard label="Alta severidad" value={totals.high} />
        <MetricCard
          label="Resolución promedio"
          value={formatMinutes(averageResolution)}
        />
      </div>

      <OperationalBarChart
        title="Incidencias por categoría"
        items={visibleIncidents.map((incident) => ({
          id: incident.category_id ?? `legacy-${incident.category_scope}`,
          label: incident.category_name,
          value: toNumber(incident.total_count),
          detail: `${incident.category_scope === "plant" ? "Planta" : incident.category_scope === "unit" ? "Unidad" : "Histórica"} · ${toNumber(incident.open_count)} abiertas`,
        }))}
      />

      <OperationalBarChart
        title="Incidencias por día"
        items={daily.map((day) => ({
          id: day.activity_date,
          label: new Intl.DateTimeFormat("es-MX", {
            day: "2-digit",
            month: "short",
          }).format(new Date(`${day.activity_date}T12:00:00`)),
          value: toNumber(day.total_count),
          detail: `${toNumber(day.open_count)} abiertas · ${toNumber(day.high_count)} altas`,
        }))}
      />
    </div>
  );
}

export function ShiftClosingHistoryPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = useAuth();
  const canViewReports = can("reports.view");
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

  const handleViewChange = (view: OperationalHistoryView) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("view", view);
    setSearchParams(nextParams, { replace: true });
  };

  const totalActivity = useMemo(
    () =>
      operationalHistory.data.users.reduce(
        (total, user) => total + toNumber(user.total_activity_count),
        0,
      ),
    [operationalHistory.data.users],
  );

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
              Consulta quién hizo qué y dónde se concentra la afectación.
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

      {operationalHistory.isLoading && activeView !== "cierres" ? (
        <section className="rounded-sm border border-line bg-panel p-5 text-sm text-muted">
          Cargando historial operativo...
        </section>
      ) : (
        <>
          {activeView === "personal" && (
            <PersonalView users={operationalHistory.data.users} />
          )}

          {activeView === "unidades" && (
            <UnitsView
              units={operationalHistory.data.units}
              statusDurations={operationalHistory.data.statusDurations}
            />
          )}

          {activeView === "incidencias" && (
            <IncidentsView
              incidents={operationalHistory.data.incidents}
              daily={operationalHistory.data.incidentDaily}
            />
          )}
        </>
      )}

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
            <ShiftClosingHistoryList items={closingHistory.items} />
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
    </div>
  );
}
