import { supabase } from "../../../lib/supabase/client";
import type { Plant, PlantRow } from "../types/plant.types";

function mapPlant(row: PlantRow): Plant {
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

export async function getPlants(): Promise<Plant[]> {
  const { data, error } = await supabase
    .from("plants")
    .select(
      "id, code, name, description, sort_order, is_active, created_at, updated_at",
    )
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as PlantRow[]).map(mapPlant);
}
