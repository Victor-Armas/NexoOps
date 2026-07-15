import { useState } from "react";
import type {
  IncidentActivityReportRow,
  IncidentDailyReportRow,
} from "../types/operational-history.types";
import {
  formatHistoryMinutes,
  toHistoryNumber,
} from "../utils/history-format";
import { HistoryMetricCard } from "./HistoryMetricCard";
import { OperationalBarChart } from "./OperationalBarChart";

export function IncidentsHistoryView({
  incidents,
  daily,
}: {
  incidents: IncidentActivityReportRow[];
  daily: IncidentDailyReportRow[];
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
      total: summary.total + toHistoryNumber(incident.total_count),
      open: summary.open + toHistoryNumber(incident.open_count),
      high: summary.high + toHistoryNumber(incident.high_count),
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
          <span className="mb-2 block text-xs font-semibold text-muted">Tipo</span>
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
        <HistoryMetricCard label="Total" value={totals.total} />
        <HistoryMetricCard label="Abiertas" value={totals.open} />
        <HistoryMetricCard label="Alta severidad" value={totals.high} />
        <HistoryMetricCard
          label="Resolución promedio"
          value={formatHistoryMinutes(averageResolution)}
        />
      </div>

      <OperationalBarChart
        title="Incidencias por categoría"
        items={visibleIncidents.map((incident) => ({
          id: incident.category_id ?? `legacy-${incident.category_scope}`,
          label: incident.category_name,
          value: toHistoryNumber(incident.total_count),
          detail: `${incident.category_scope === "plant" ? "Planta" : incident.category_scope === "unit" ? "Unidad" : "Histórica"} · ${toHistoryNumber(incident.open_count)} abiertas`,
        }))}
      />

      <OperationalBarChart
        title="Incidencias por día"
        items={daily.map((day) => ({
          id: day.activity_date,
          label: new Intl.DateTimeFormat("es-MX", {
            day: "2-digit",
            month: "short",
            timeZone: "America/Monterrey",
          }).format(new Date(`${day.activity_date}T12:00:00-06:00`)),
          value: toHistoryNumber(day.total_count),
          detail: `${toHistoryNumber(day.open_count)} abiertas · ${toHistoryNumber(day.high_count)} altas`,
        }))}
      />
    </div>
  );
}
