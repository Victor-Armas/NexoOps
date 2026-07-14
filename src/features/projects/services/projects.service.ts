import { supabase } from "../../../lib/supabase/client";
import type { Project, ProjectRow } from "../types/project.types";

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, code, name, description")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<ProjectRow[]>();

  if (error) throw error;

  return data.map(mapProject);
}
