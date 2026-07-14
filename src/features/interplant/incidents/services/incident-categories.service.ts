import { supabase } from "../../../../lib/supabase/client";
import type {
  IncidentCategory,
  IncidentCategoryRow,
  SaveIncidentCategoryPayload,
} from "../types/incident-category.types";

const INCIDENT_CATEGORY_COLUMNS =
  "id, project_id, scope, code, name, description, default_severity, is_active, created_by, created_at, updated_at";

function mapIncidentCategory(row: IncidentCategoryRow): IncidentCategory {
  return {
    id: row.id,
    projectId: row.project_id,
    scope: row.scope,
    code: row.code,
    name: row.name,
    description: row.description,
    defaultSeverity: row.default_severity,
    isActive: row.is_active,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getIncidentCategories(
  projectId: string,
  activeOnly = true,
): Promise<IncidentCategory[]> {
  let query = supabase
    .from("incident_categories")
    .select(INCIDENT_CATEGORY_COLUMNS)
    .eq("project_id", projectId)
    .order("scope", { ascending: true })
    .order("name", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.returns<IncidentCategoryRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapIncidentCategory);
}

export async function saveIncidentCategory(
  payload: SaveIncidentCategoryPayload,
): Promise<IncidentCategory> {
  const values = {
    project_id: payload.projectId,
    scope: payload.scope,
    code: payload.code.trim().toLowerCase(),
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    default_severity: payload.defaultSeverity,
    is_active: payload.isActive,
    updated_at: new Date().toISOString(),
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from("incident_categories")
      .update(values)
      .eq("id", payload.id)
      .select(INCIDENT_CATEGORY_COLUMNS)
      .single<IncidentCategoryRow>();

    if (error) {
      throw error;
    }

    return mapIncidentCategory(data);
  }

  const { data, error } = await supabase
    .from("incident_categories")
    .insert({
      ...values,
      created_by: payload.createdBy,
    })
    .select(INCIDENT_CATEGORY_COLUMNS)
    .single<IncidentCategoryRow>();

  if (error) {
    throw error;
  }

  return mapIncidentCategory(data);
}
