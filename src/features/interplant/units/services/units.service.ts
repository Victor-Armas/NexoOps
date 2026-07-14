import { supabase } from "../../../../lib/supabase/client";
import type { ProjectUnitRow, Unit, UnitRow } from "../types/unit.types";

function mapUnit(row: UnitRow): Unit {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUnitsByProject(projectId: string): Promise<Unit[]> {
  const { data: projectUnits, error: projectUnitsError } = await supabase
    .from("project_units")
    .select("unit_id")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .returns<ProjectUnitRow[]>();

  if (projectUnitsError) {
    throw projectUnitsError;
  }

  if (projectUnits.length === 0) {
    return [];
  }

  const unitIds = projectUnits.map((item) => item.unit_id);

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, code, name, description, is_active, created_at, updated_at")
    .in("id", unitIds)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<UnitRow[]>();

  if (unitsError) {
    throw unitsError;
  }

  return units.map(mapUnit);
}
