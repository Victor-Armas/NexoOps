import { supabase } from "../../../../lib/supabase/client";
import type {
  CreateIncidentPayload,
  Incident,
  IncidentRow,
  UpdateIncidentStatusPayload,
} from "../types/incident.types";

const INCIDENT_COLUMNS =
  "id, project_id, shift_id, unit_id, plant_id, category_id, subject_type, title, description, severity, status, occurred_at, created_by, resolved_at, created_at, updated_at";

function mapIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    projectId: row.project_id,
    shiftId: row.shift_id,
    unitId: row.unit_id,
    plantId: row.plant_id,
    categoryId: row.category_id,
    subjectType: row.subject_type,
    title: row.title,
    description: row.description,
    severity: row.severity,
    status: row.status,
    occurredAt: row.occurred_at,
    createdBy: row.created_by,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getIncidentsByShift(
  shiftId: string,
): Promise<Incident[]> {
  const { data, error } = await supabase
    .from("incidents")
    .select(INCIDENT_COLUMNS)
    .eq("shift_id", shiftId)
    .order("occurred_at", { ascending: false })
    .returns<IncidentRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapIncident);
}

export async function createIncident(
  payload: CreateIncidentPayload,
): Promise<Incident> {
  const { data, error } = await supabase
    .from("incidents")
    .insert({
      project_id: payload.projectId,
      shift_id: payload.shiftId,
      unit_id: payload.unitId,
      plant_id: payload.plantId,
      category_id: payload.categoryId,
      subject_type: payload.subjectType,
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      severity: payload.severity,
      occurred_at: payload.occurredAt,
      created_by: payload.createdBy,
    })
    .select(INCIDENT_COLUMNS)
    .single<IncidentRow>();

  if (error) {
    throw error;
  }

  return mapIncident(data);
}

export async function updateIncidentStatus({
  incidentId,
  status,
}: UpdateIncidentStatusPayload): Promise<Incident> {
  const { data, error } = await supabase
    .from("incidents")
    .update({
      status,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", incidentId)
    .select(INCIDENT_COLUMNS)
    .single<IncidentRow>();

  if (error) {
    throw error;
  }

  return mapIncident(data);
}
