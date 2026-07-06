import { supabase } from "../../../lib/supabase/client";
import type { Project, ProjectRow } from "../types/project.types";

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, code, name, description, sort_order, is_active, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as ProjectRow[]).map(mapProject);
}
