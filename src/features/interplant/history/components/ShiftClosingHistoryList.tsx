import {
  CalendarDays,
  CheckCircle2,
  Factory,
  Trash2,
  UsersRound,
} from "lucide-react";
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
import {
  formatMonterreyDateTime,
  formatMonterreyTime,
  MONTERREY_TIME_ZONE,
} from "../../../../lib/date-time/monterrey-time";
import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import type { PlantCheckActivityReportRow } from "../types/plant-check-activity.types";
import type { ShiftClosingHistoryItem } from "../types/shift-closing-history.types";
import { OperationalBarChart } from "./OperationalBarChart";

type ShiftClosingHistoryListProps = {
  items: ShiftClosingHistoryItem[];
  plantCheckActivity: PlantCheckActivityReportRow[];
  canDeleteShift: boolean;
  onRequestDelete: (item: ShiftClosingHistoryItem) => void;
};

type PlantWalkDetail = {
  plantId: string;
  plantCode: string;
  plantName: string;
  count: number;
  users: PlantCheckActivityReportRow[];
};

const shortDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  timeZone: MONTERREY_TIME_ZONE,
});

const tooltipStyle = {
  backgroundColor: "#1e1b16",
  border: "1px solid rgba(237, 230, 214, 0.18)",
  borderRadius: "6px",
  color: "#f4efe5",
  fontSize: "12px",
};

function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T12:00:00-06:00`));
}

function formatReviewLabel(count: number) {
  return count === 1 ? "1 recorrido" : `${count} recorridos`;
}

function getShiftActivity(
  plantCheckActivity: PlantCheckActivityReportRow[],
  shiftId: string,
) {
  return plantCheckActivity.filter((row) => row.shift_id === shiftId);
}

function getPlantWalkDetails(rows: PlantCheckActivityReportRow[]) {
  const details = new Map<string, PlantWalkDetail>();

  rows.forEach((row) => {
    const current = details.get(row.plant_id);

    if (current) {
      current.count += Number(row.check_count);
      current.users.push(row);
      return;
    }

    details.set(row.plant_id, {
      plantId: row.plant_id,
      plantCode: row.plant_code,
      plantName: row.plant_name,
      count: Number(row.check_count),
      users: [row],
    });
  });

  return [...details.values()]
    .map((detail) => ({
      ...detail,
      users: detail.users
        .slice()
        .sort((first, second) => Number(second.check_count) - Number(first.check_count)),
    }))
    .sort((first, second) => first.plantCode.localeCompare(second.plantCode, "es-MX"));
}

function HistoryMetric({ label, value }: { label: string; value: string | number }) {
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
  plantCheckActivity,
  canDeleteShift,
  onRequestDelete,
}: ShiftClosingHistoryListProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-sm border border-line bg-panel p-5 text-sm text-muted">
        No hay cierres guardados con los filtros seleccionados.
      </section>
    );
  }

  const chronologicalItems = [...items].reverse();
  const chartData = chronologicalItems.map((item) => {
    const shiftActivity = getShiftActivity(plantCheckActivity, item.shiftId);
    const reviews = shiftActivity.reduce(
      (total, row) => total + Number(row.check_count),
      0,
    );

    return {
      date: formatShortDate(item.shiftDate),
      movimientos: item.movementTotalCount,
      incidencias: item.incidentTotalCount,
      recorridos: reviews,
    };
  });

  const totals = items.reduce(
    (summary, item) => {
      const reviews = getShiftActivity(plantCheckActivity, item.shiftId).reduce(
        (total, row) => total + Number(row.check_count),
        0,
      );

      return {
        movements: summary.movements + item.movementTotalCount,
        incidents: summary.incidents + item.incidentTotalCount,
        reviews: summary.reviews + reviews,
      };
    },
    { movements: 0, incidents: 0, reviews: 0 },
  );

  const averageReviews =
    items.length > 0 ? Math.round((totals.reviews / items.length) * 10) / 10 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <HistoryMetric label="Turnos cerrados" value={items.length} />
        <HistoryMetric label="Recorridos totales" value={totals.reviews} />
        <HistoryMetric label="Promedio por turno" value={averageReviews} />
        <HistoryMetric label="Movimientos" value={totals.movements} />
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
            Recorridos por cierre
          </p>
          <p className="mt-1 font-ibm-plex-mono text-[9px] text-muted">
            Total real de revisiones registradas durante cada turno
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
                allowDecimals={false}
                tick={{ fill: "#b9b2a2", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="recorridos"
                name="Recorridos"
                fill="#e8a33d"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-principal" />
          <span className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            Evidencia por turno
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        {items.map((item) => {
          const shiftActivity = getShiftActivity(plantCheckActivity, item.shiftId);
          const plantDetails = getPlantWalkDetails(shiftActivity);
          const reviewTotal = plantDetails.reduce(
            (total, plant) => total + plant.count,
            0,
          );
          const reviewerCount = new Set(
            shiftActivity.map((row) => row.user_id),
          ).size;

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
                    {item.shiftDate} · Cerrado {formatMonterreyDateTime(item.closedAt)}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">
                    Abierto {formatMonterreyDateTime(item.openedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-success/40 bg-success/10 px-2 py-1 font-ibm-plex-mono text-[8px] uppercase tracking-[0.08em] text-success">
                    <CheckCircle2 size={12} /> Cerrado
                  </span>

                  {canDeleteShift && (
                    <button
                      type="button"
                      aria-label="Eliminar turno permanentemente"
                      title="Eliminar turno permanentemente"
                      onClick={() => onRequestDelete(item)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-danger/30 text-danger transition hover:bg-danger/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-1 text-center">
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">{reviewTotal}</p>
                  <p className="mt-1 text-[8px] text-muted">Recorridos</p>
                </div>
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">
                    {plantDetails.length}/{item.plantTotalCount}
                  </p>
                  <p className="mt-1 text-[8px] text-muted">Plantas</p>
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
              </div>

              <div className="mt-3 flex flex-wrap gap-2 font-ibm-plex-mono text-[8px] uppercase tracking-[0.06em] text-muted">
                <span className="rounded-sm border border-line px-2 py-1">
                  Personal {reviewerCount}
                </span>
                <span className="rounded-sm border border-line px-2 py-1">
                  Riesgo alto {item.highRiskPlantCount}
                </span>
                <span className="rounded-sm border border-line px-2 py-1">
                  Incid. abiertas {item.incidentOpenCount}
                </span>
                <span className="rounded-sm border border-line px-2 py-1">
                  Mov. pendientes {item.movementOpenCount}
                </span>
              </div>

              <div className="mt-4">
                <OperationalBarChart
                  title="Recorridos por planta"
                  items={plantDetails.map((plant) => ({
                    id: plant.plantId,
                    label: plant.plantCode,
                    value: plant.count,
                    detail: `${plant.plantName} · ${formatReviewLabel(plant.count)}`,
                  }))}
                  emptyMessage="Este turno no tiene recorridos de planta registrados."
                />
              </div>

              <section className="mt-4 rounded-sm border border-line bg-surface-dark p-3">
                <div className="mb-3 flex items-center gap-2">
                  <UsersRound size={13} className="text-principal" />
                  <p className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                    Quién recorrió cada planta
                  </p>
                </div>

                {plantDetails.length === 0 ? (
                  <p className="text-xs text-muted">
                    Sin recorridos registrados durante este turno.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {plantDetails.map((plant) => (
                      <div
                        key={plant.plantId}
                        className="rounded-sm border border-line bg-panel p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <Factory size={14} className="mt-0.5 text-principal" />
                            <div>
                              <p className="text-sm font-semibold">
                                {plant.plantCode} · {plant.plantName}
                              </p>
                              <p className="mt-1 text-[10px] text-muted">
                                {formatReviewLabel(plant.count)} en total
                              </p>
                            </div>
                          </div>
                          <span className="font-ibm-plex-mono text-sm font-bold text-principal">
                            {plant.count}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          {plant.users.map((user) => (
                            <div
                              key={`${plant.plantId}-${user.user_id}`}
                              className="flex items-start justify-between gap-3 border-t border-line pt-2 first:border-t-0 first:pt-0"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold">
                                  {user.full_name}
                                </p>
                                <p className="mt-1 text-[10px] text-muted">
                                  {formatMonterreyTime(user.first_checked_at)}
                                  {user.first_checked_at !== user.last_checked_at
                                    ? ` – ${formatMonterreyTime(user.last_checked_at)}`
                                    : ""}
                                </p>
                              </div>
                              <span className="shrink-0 font-ibm-plex-mono text-xs text-principal">
                                {formatReviewLabel(Number(user.check_count))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

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
