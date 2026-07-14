import { CalendarDays, CheckCircle2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import type { ShiftClosingHistoryItem } from "../types/shift-closing-history.types";

type ShiftClosingHistoryListProps = {
  items: ShiftClosingHistoryItem[];
};

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
});

const tooltipStyle = {
  backgroundColor: "#1e1b16",
  border: "1px solid rgba(237, 230, 214, 0.18)",
  borderRadius: "6px",
  color: "#f4efe5",
  fontSize: "12px",
};

function formatDateTime(value: string | null) {
  if (!value) return "Sin dato";
  return dateTimeFormatter.format(new Date(value));
}

function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T12:00:00`));
}

type HistoryMetricProps = {
  label: string;
  value: string | number;
};

function HistoryMetric({ label, value }: HistoryMetricProps) {
  return (
    <div className="rounded-sm border border-line bg-panel p-3">
      <p className="font-ibm-plex-mono text-[8px] uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-barlow-condensed text-2xl font-bold text-principal">
        {value}
      </p>
    </div>
  );
}

export function ShiftClosingHistoryList({
  items,
}: ShiftClosingHistoryListProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-sm border border-line bg-panel p-5 text-sm text-muted">
        No hay cierres guardados con los filtros seleccionados.
      </section>
    );
  }

  const chronologicalItems = [...items].reverse();
  const chartData = chronologicalItems.map((item) => ({
    date: formatShortDate(item.shiftDate),
    movimientos: item.movementTotalCount,
    incidencias: item.incidentTotalCount,
    cobertura:
      item.plantTotalCount > 0
        ? Math.round((item.plantCheckedCount / item.plantTotalCount) * 100)
        : 0,
  }));

  const totals = items.reduce(
    (summary, item) => ({
      movements: summary.movements + item.movementTotalCount,
      incidents: summary.incidents + item.incidentTotalCount,
      reviews: summary.reviews + item.plantCheckedCount,
      totalPlants: summary.totalPlants + item.plantTotalCount,
    }),
    { movements: 0, incidents: 0, reviews: 0, totalPlants: 0 },
  );

  const averageCoverage =
    totals.totalPlants > 0
      ? Math.round((totals.reviews / totals.totalPlants) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <HistoryMetric label="Turnos cerrados" value={items.length} />
        <HistoryMetric label="Cobertura promedio" value={`${averageCoverage}%`} />
        <HistoryMetric label="Movimientos" value={totals.movements} />
        <HistoryMetric label="Incidencias" value={totals.incidents} />
      </div>

      <section className="rounded-sm border border-line bg-panel p-4">
        <div className="mb-4">
          <p className="font-barlow-condensed text-base font-bold">
            Actividad por cierre
          </p>
          <p className="mt-1 font-ibm-plex-mono text-[9px] text-muted">
            Comparación de movimientos e incidencias entre turnos
          </p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
            >
              <CartesianGrid stroke="rgba(237,230,214,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#b9b2a2", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#b9b2a2", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "10px", color: "#b9b2a2" }} />
              <Line
                type="monotone"
                dataKey="movimientos"
                name="Movimientos"
                stroke="#e8a33d"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#e8a33d" }}
              />
              <Line
                type="monotone"
                dataKey="incidencias"
                name="Incidencias"
                stroke="#d95745"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#d95745" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-sm border border-line bg-panel p-4">
        <div className="mb-4">
          <p className="font-barlow-condensed text-base font-bold">
            Cobertura de plantas
          </p>
          <p className="mt-1 font-ibm-plex-mono text-[9px] text-muted">
            Porcentaje de plantas revisadas antes de cada cierre
          </p>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
            >
              <CartesianGrid stroke="rgba(237,230,214,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#b9b2a2", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#b9b2a2", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="cobertura"
                name="Cobertura %"
                fill="#82ad70"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-principal" />
          <span className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            Evidencia por turno
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        {items.map((item) => {
          const coverage =
            item.plantTotalCount > 0
              ? Math.round(
                  (item.plantCheckedCount / item.plantTotalCount) * 100,
                )
              : 0;

          return (
            <article
              key={item.id}
              className="rounded-sm border border-line bg-panel p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-barlow-condensed text-lg font-bold">
                    {SHIFT_TYPE_LABELS[item.shiftType]}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Cerrado: {formatDateTime(item.closedAt)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-success/40 bg-success/10 px-2 py-1 font-ibm-plex-mono text-[8px] uppercase tracking-[0.08em] text-success">
                  <CheckCircle2 size={12} /> Cerrado
                </span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-1 text-center">
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">{coverage}%</p>
                  <p className="mt-1 text-[8px] text-muted">Cobertura</p>
                </div>
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">
                    {item.movementCompletedCount}
                  </p>
                  <p className="mt-1 text-[8px] text-muted">Completados</p>
                </div>
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">{item.incidentTotalCount}</p>
                  <p className="mt-1 text-[8px] text-muted">Incidencias</p>
                </div>
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">{item.movementOpenCount}</p>
                  <p className="mt-1 text-[8px] text-muted">Pendientes</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 font-ibm-plex-mono text-[8px] uppercase tracking-[0.06em] text-muted">
                <span className="rounded-sm border border-line px-2 py-1">
                  Riesgo alto {item.highRiskPlantCount}
                </span>
                <span className="rounded-sm border border-line px-2 py-1">
                  Incid. abiertas {item.incidentOpenCount}
                </span>
                <span className="rounded-sm border border-line px-2 py-1">
                  Cantidad {item.movementQuantityTotal}
                </span>
              </div>

              {item.notes && (
                <p className="mt-3 rounded-sm border border-line bg-surface-dark p-3 text-xs leading-5 text-muted">
                  {item.notes}
                </p>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
