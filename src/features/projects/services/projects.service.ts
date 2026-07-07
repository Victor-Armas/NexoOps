import { supabase } from "../../../lib/supabase/client";
import type { Project, ProjectRow } from "../types/project.types";

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, code, name, description, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<ProjectRow[]>();

  if (error) throw error;

  return data.map(mapProject);
}
