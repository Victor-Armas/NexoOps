export type IncidentSeverity = "low" | "medium" | "high";
export type IncidentStatus = "open" | "resolved";

export type Incident = {
  id: string;
  projectId: string;
  shiftId: string;
  unitId: string | null;
  plantId: string | null;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  occurredAt: string;
  createdBy: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IncidentRow = {
  id: string;
  project_id: string;
  shift_id: string;
  unit_id: string | null;
  plant_id: string | null;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  occurred_at: string;
  created_by: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateIncidentPayload = {
  projectId: string;
  shiftId: string;
  unitId: string | null;
  plantId: string | null;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  occurredAt: string;
  createdBy: string;
};

export type UpdateIncidentStatusPayload = {
  incidentId: string;
  status: IncidentStatus;
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: "Abierta",
  resolved: "Resuelta",
};
