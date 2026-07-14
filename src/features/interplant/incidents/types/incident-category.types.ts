import type { IncidentSeverity } from "./incident.types";

export type IncidentSubjectType = "plant" | "unit";

export type IncidentCategory = {
  id: string;
  projectId: string;
  scope: IncidentSubjectType;
  code: string;
  name: string;
  description: string | null;
  defaultSeverity: IncidentSeverity;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IncidentCategoryRow = {
  id: string;
  project_id: string;
  scope: IncidentSubjectType;
  code: string;
  name: string;
  description: string | null;
  default_severity: IncidentSeverity;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveIncidentCategoryPayload = {
  id?: string;
  projectId: string;
  scope: IncidentSubjectType;
  code: string;
  name: string;
  description: string | null;
  defaultSeverity: IncidentSeverity;
  isActive: boolean;
  createdBy: string;
};
