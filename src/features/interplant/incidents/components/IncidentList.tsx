import { CheckCircle2, RotateCcw, TriangleAlert } from "lucide-react";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type { Incident, IncidentStatus } from "../types/incident.types";
import {
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
} from "../types/incident.types";

type IncidentListProps = {
  incidents: Incident[];
  plants: Plant[];
  units: Unit[];
  isSaving: boolean;
  onUpdateStatus: (incidentId: string, status: IncidentStatus) => Promise<void>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPlantName(plants: Plant[], plantId: string | null) {
  if (!plantId) return "Sin planta";

  return plants.find((plant) => plant.id === plantId)?.name ?? "Planta no disponible";
}

function getUnitName(units: Unit[], unitId: string | null) {
  if (!unitId) return "Sin unidad";

  return units.find((unit) => unit.id === unitId)?.name ?? "Unidad no disponible";
}

function getSeverityClassName(severity: Incident["severity"]) {
  if (severity === "high") {
    return "bg-red-500/10 text-red-300 light:bg-red-50 light:text-red-600";
  }

  if (severity === "medium") {
    return "bg-yellow-400/10 text-yellow-200 light:bg-yellow-50 light:text-yellow-700";
  }

  return "bg-emerald-400/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700";
}

export function IncidentList({
  incidents,
  plants,
  units,
  isSaving,
  onUpdateStatus,
}: IncidentListProps) {
  const openIncidents = incidents.filter((incident) => incident.status === "open");
  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "resolved",
  );

  if (incidents.length === 0) {
    return (
      <section className="rounded-4xl border border-white/10 bg-white/10 p-5 text-sm text-slate-400 shadow-xl light:border-slate-200 light:bg-white light:text-slate-500">
        No hay incidencias registradas para este turno.
      </section>
    );
  }

  return (
    <section className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 light:bg-red-50 light:text-red-600">
          <TriangleAlert size={22} />
        </div>

        <div>
          <h3 className="text-lg font-bold">Incidencias del turno</h3>
          <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
            Abiertas: {openIncidents.length} · Resueltas: {resolvedIncidents.length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => (
          <article
            key={incident.id}
            className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold">{incident.title}</h4>
                <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
                  {formatDateTime(incident.occurredAt)}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getSeverityClassName(incident.severity)}`}
              >
                {INCIDENT_SEVERITY_LABELS[incident.severity]}
              </span>
            </div>

            {incident.description && (
              <p className="mt-3 text-sm text-slate-300 light:text-slate-700">
                {incident.description}
              </p>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 light:text-slate-500">
              <span>{getPlantName(plants, incident.plantId)}</span>
              <span>{getUnitName(units, incident.unitId)}</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  incident.status === "open"
                    ? "bg-cyan-400/10 text-cyan-200 light:bg-cyan-50 light:text-cyan-700"
                    : "bg-emerald-400/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700"
                }`}
              >
                {INCIDENT_STATUS_LABELS[incident.status]}
              </span>

              {incident.status === "open" ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void onUpdateStatus(incident.id, "resolved")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 px-3 py-2 text-xs font-bold text-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 light:text-emerald-700"
                >
                  <CheckCircle2 size={15} />
                  Resolver
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void onUpdateStatus(incident.id, "open")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 px-3 py-2 text-xs font-bold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 light:text-cyan-700"
                >
                  <RotateCcw size={15} />
                  Reabrir
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
