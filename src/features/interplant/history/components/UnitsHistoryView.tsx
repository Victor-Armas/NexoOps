import { Truck } from "lucide-react";
import { useState } from "react";
import type {
  UnitActivityReportRow,
  UnitStatusDurationReportRow,
} from "../types/operational-history.types";
import {
  formatHistoryMinutes,
  toHistoryNumber,
} from "../utils/history-format";
import { HistoryMetricCard } from "./HistoryMetricCard";
import { OperationalBarChart } from "./OperationalBarChart";

export function UnitsHistoryView({
  units,
  statusDurations,
}: {
  units: UnitActivityReportRow[];
  statusDurations: UnitStatusDurationReportRow[];
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
      movements: summary.movements + toHistoryNumber(unit.movement_count),
      completed:
        summary.completed + toHistoryNumber(unit.completed_movement_count),
      events: summary.events + toHistoryNumber(unit.event_count),
      incidents: summary.incidents + toHistoryNumber(unit.incident_count),
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
        <HistoryMetricCard label="Movimientos" value={totals.movements} />
        <HistoryMetricCard label="Completados" value={totals.completed} />
        <HistoryMetricCard
          label="Traslado promedio"
          value={formatHistoryMinutes(averageTransport)}
        />
        <HistoryMetricCard label="Incidencias" value={totals.incidents} />
      </div>

      <OperationalBarChart
        title="Movimientos por unidad"
        items={visibleUnits.map((unit) => ({
          id: unit.unit_id,
          label: unit.unit_name,
          value: toHistoryNumber(unit.movement_count),
          detail: `${toHistoryNumber(unit.completed_movement_count)} completados · ${toHistoryNumber(unit.event_count)} estatus`,
        }))}
      />

      <OperationalBarChart
        title="Tiempo promedio por estatus"
        valueSuffix=" min"
        items={visibleDurations
          .slice()
          .sort(
            (first, second) =>
              toHistoryNumber(second.average_minutes) -
              toHistoryNumber(first.average_minutes),
          )
          .slice(0, 12)
          .map((row) => ({
            id: `${row.unit_id}-${row.event_type}`,
            label: row.event_label,
            value: toHistoryNumber(row.average_minutes),
            detail: `${row.unit_name} · ${toHistoryNumber(row.occurrence_count)} registros`,
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
                  {toHistoryNumber(unit.event_count)} cambios de estatus
                </p>
              </div>
              <span className="font-ibm-plex-mono text-lg font-bold text-principal">
                {toHistoryNumber(unit.movement_count)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">
                  {toHistoryNumber(unit.completed_movement_count)}
                </p>
                <p className="mt-1 text-[9px] text-muted">Completados</p>
              </div>
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">
                  {formatHistoryMinutes(unit.average_transport_minutes)}
                </p>
                <p className="mt-1 text-[9px] text-muted">Promedio</p>
              </div>
              <div className="rounded-sm bg-surface-dark p-2">
                <p className="text-sm font-bold">
                  {toHistoryNumber(unit.incident_count)}
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
