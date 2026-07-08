import { supabase } from "../../../../lib/supabase/client";
import type { ProjectUnitRow, Unit, UnitRow } from "../types/unit.types";

function mapUnit(row: UnitRow, sortOrder: number): Unit {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUnitsByProject(projectId: string): Promise<Unit[]> {
  const { data: projectUnits, error: projectUnitsError } = await supabase
    .from("project_units")
    .select("unit_id, sort_order")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
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
    .select(
      "id, code, name, description, sort_order, is_active, created_at, updated_at",
    )
    .in("id", unitIds)
    .eq("is_active", true)
    .returns<UnitRow[]>();

  if (unitsError) {
    throw unitsError;
  }

  return projectUnits
    .map((projectUnit) => {
      const unit = units.find((item) => item.id === projectUnit.unit_id);

      if (!unit) return null;

      return mapUnit(unit, projectUnit.sort_order);
    })
    .filter((unit): unit is Unit => unit !== null);
}
