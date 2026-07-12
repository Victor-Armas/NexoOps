import type { Incident } from "../types/incident.types";

export type IncidentMetrics = {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  highSeverityIncidents: number;
};

export function getIncidentMetrics(incidents: Incident[]): IncidentMetrics {
  return {
    totalIncidents: incidents.length,
    openIncidents: incidents.filter((incident) => incident.status === "open")
      .length,
    resolvedIncidents: incidents.filter(
      (incident) => incident.status === "resolved",
    ).length,
    highSeverityIncidents: incidents.filter(
      (incident) => incident.severity === "high",
    ).length,
  };
}
