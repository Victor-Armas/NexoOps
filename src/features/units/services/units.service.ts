import { supabase } from "../../../lib/supabase/client";
import type { Unit, UnitRow } from "../types/unit.types";

function mapUnit(row: UnitRow): Unit {
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

export async function getUnits(): Promise<Unit[]> {
  const { data, error } = await supabase
    .from("units")
    .select(
      "id, code, name, description, sort_order, is_active, created_at, updated_at",
    )
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as UnitRow[]).map(mapUnit);
}
