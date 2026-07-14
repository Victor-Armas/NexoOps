import {
  CheckCircle2,
  Factory,
  RotateCcw,
  TriangleAlert,
  Truck,
} from "lucide-react";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type { IncidentCategory } from "../types/incident-category.types";
import type { Incident, IncidentStatus } from "../types/incident.types";
import {
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
} from "../types/incident.types";

type IncidentListProps = {
  incidents: Incident[];
  plants: Plant[];
  units: Unit[];
  categories: IncidentCategory[];
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
  if (!plantId) return null;

  return plants.find((plant) => plant.id === plantId)?.name ?? "Planta no disponible";
}

function getUnitName(units: Unit[], unitId: string | null) {
  if (!unitId) return null;

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
  categories,
  isSaving,
  onUpdateStatus,
}: IncidentListProps) {
  const openIncidents = incidents.filter((incident) => incident.status === "open");
  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "resolved",
  );

  if (incidents.length === 0) {
    return (
      <section className="rounded-sm border border-line bg-panel p-5 text-sm text-muted shadow-xl">
        No hay incidencias registradas para este turno.
      </section>
    );
  }

  return (
    <section className="rounded-sm border border-line bg-panel p-5 shadow-xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-red-500/10 text-red-300">
          <TriangleAlert size={22} />
        </div>

        <div>
          <h3 className="text-lg font-bold">Incidencias del turno</h3>
          <p className="mt-1 text-sm text-muted">
            Abiertas: {openIncidents.length} · Resueltas: {resolvedIncidents.length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => {
          const category = categories.find(
            (currentCategory) => currentCategory.id === incident.categoryId,
          );
          const plantName = getPlantName(plants, incident.plantId);
          const unitName = getUnitName(units, incident.unitId);
          const subjectLabel = plantName ?? unitName ?? "Sin objeto relacionado";
          const SubjectIcon = incident.subjectType === "unit" ? Truck : Factory;

          return (
            <article
              key={incident.id}
              className="rounded-sm border border-line bg-surface-dark p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-principal">
                    <SubjectIcon size={14} />
                    <span className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.08em]">
                      {incident.subjectType === "unit" ? "Unidad" : "Planta"}
                    </span>
                  </div>
                  <h4 className="mt-2 font-bold">
                    {category?.name ?? incident.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    {subjectLabel} · {formatDateTime(incident.occurredAt)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getSeverityClassName(incident.severity)}`}
                >
                  {INCIDENT_SEVERITY_LABELS[incident.severity]}
                </span>
              </div>

              {incident.description && (
                <p className="mt-3 text-sm text-muted">{incident.description}</p>
              )}

              <div className="mt-4 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    incident.status === "open"
                      ? "bg-principal/10 text-principal"
                      : "bg-emerald-400/10 text-emerald-300"
                  }`}
                >
                  {INCIDENT_STATUS_LABELS[incident.status]}
                </span>

                {incident.status === "open" ? (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void onUpdateStatus(incident.id, "resolved")}
                    className="inline-flex items-center gap-2 rounded-sm border border-emerald-400/30 px-3 py-2 text-xs font-bold text-emerald-300 disabled:opacity-60"
                  >
                    <CheckCircle2 size={15} />
                    Resolver
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void onUpdateStatus(incident.id, "open")}
                    className="inline-flex items-center gap-2 rounded-sm border border-principal/30 px-3 py-2 text-xs font-bold text-principal disabled:opacity-60"
                  >
                    <RotateCcw size={15} />
                    Reabrir
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
