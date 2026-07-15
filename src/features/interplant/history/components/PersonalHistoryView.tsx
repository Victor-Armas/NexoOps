import { Factory, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { formatMonterreyDateTime } from "../../../../lib/date-time/monterrey-time";
import type { UserActivityReportRow } from "../types/operational-history.types";
import type { PlantCheckActivityReportRow } from "../types/plant-check-activity.types";
import { toHistoryNumber } from "../utils/history-format";
import { HistoryMetricCard } from "./HistoryMetricCard";
import { OperationalBarChart } from "./OperationalBarChart";

type PlantWalkSummary = {
  plantId: string;
  plantCode: string;
  plantName: string;
  count: number;
};

function aggregatePlantWalks(rows: PlantCheckActivityReportRow[]) {
  const summaries = new Map<string, PlantWalkSummary>();

  rows.forEach((row) => {
    const current = summaries.get(row.plant_id);

    if (current) {
      current.count += toHistoryNumber(row.check_count);
      return;
    }

    summaries.set(row.plant_id, {
      plantId: row.plant_id,
      plantCode: row.plant_code,
      plantName: row.plant_name,
      count: toHistoryNumber(row.check_count),
    });
  });

  return [...summaries.values()].sort((first, second) => {
    if (second.count !== first.count) return second.count - first.count;
    return first.plantCode.localeCompare(second.plantCode, "es-MX");
  });
}

export function PersonalHistoryView({
  users,
  plantChecks,
}: {
  users: UserActivityReportRow[];
  plantChecks: PlantCheckActivityReportRow[];
}) {
  const [selectedUserId, setSelectedUserId] = useState("all");
  const visibleUsers =
    selectedUserId === "all"
      ? users
      : users.filter((user) => user.user_id === selectedUserId);
  const visiblePlantChecks =
    selectedUserId === "all"
      ? plantChecks
      : plantChecks.filter((row) => row.user_id === selectedUserId);

  const totals = visibleUsers.reduce(
    (summary, user) => ({
      checks: summary.checks + toHistoryNumber(user.plant_check_count),
      events: summary.events + toHistoryNumber(user.unit_event_count),
      movements: summary.movements + toHistoryNumber(user.movement_count),
      incidents: summary.incidents + toHistoryNumber(user.incident_count),
    }),
    { checks: 0, events: 0, movements: 0, incidents: 0 },
  );

  const plantTotals = useMemo(
    () => aggregatePlantWalks(visiblePlantChecks),
    [visiblePlantChecks],
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
        <HistoryMetricCard label="Recorridos" value={totals.checks} />
        <HistoryMetricCard label="Estatus registrados" value={totals.events} />
        <HistoryMetricCard label="Movimientos" value={totals.movements} />
        <HistoryMetricCard label="Incidencias" value={totals.incidents} />
      </div>

      <OperationalBarChart
        title="Actividad por usuario"
        items={visibleUsers.map((user) => ({
          id: user.user_id,
          label: user.full_name,
          value: toHistoryNumber(user.total_activity_count),
          detail: `${toHistoryNumber(user.plant_check_count)} recorridos · ${toHistoryNumber(user.unit_event_count)} estatus`,
        }))}
      />

      <OperationalBarChart
        title="Recorridos por planta"
        items={plantTotals.map((plant) => ({
          id: plant.plantId,
          label: plant.plantCode,
          value: plant.count,
          detail: plant.plantName,
        }))}
        emptyMessage="No hay recorridos registrados para el personal seleccionado."
      />

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <UsersRound size={14} className="text-principal" />
          <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Detalle del personal
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {visibleUsers.map((user) => {
          const userPlantWalks = aggregatePlantWalks(
            plantChecks.filter((row) => row.user_id === user.user_id),
          );

          return (
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
                  {toHistoryNumber(user.total_activity_count)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">
                    {toHistoryNumber(user.plant_check_count)}
                  </p>
                  <p className="mt-1 text-[9px] text-muted">Recorridos</p>
                </div>
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">
                    {toHistoryNumber(user.unit_event_count)}
                  </p>
                  <p className="mt-1 text-[9px] text-muted">Estatus</p>
                </div>
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">
                    {toHistoryNumber(user.movement_count)}
                  </p>
                  <p className="mt-1 text-[9px] text-muted">Mov.</p>
                </div>
                <div className="rounded-sm bg-surface-dark p-2">
                  <p className="text-sm font-bold">
                    {toHistoryNumber(user.incident_count)}
                  </p>
                  <p className="mt-1 text-[9px] text-muted">Incid.</p>
                </div>
              </div>

              <div className="mt-4 rounded-sm border border-line bg-surface-dark p-3">
                <div className="mb-3 flex items-center gap-2">
                  <Factory size={13} className="text-principal" />
                  <p className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                    Recorridos por planta
                  </p>
                </div>

                {userPlantWalks.length === 0 ? (
                  <p className="text-xs text-muted">Sin recorridos registrados.</p>
                ) : (
                  <div className="space-y-2">
                    {userPlantWalks.map((plant) => (
                      <div
                        key={plant.plantId}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-principal">
                            {plant.plantCode}
                          </span>
                          <span className="ml-2 text-muted">{plant.plantName}</span>
                        </div>
                        <span className="shrink-0 font-ibm-plex-mono font-semibold">
                          {plant.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-3 text-[10px] text-muted">
                Última actividad: {user.last_activity_at
                  ? formatMonterreyDateTime(user.last_activity_at)
                  : "Sin actividad"}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
