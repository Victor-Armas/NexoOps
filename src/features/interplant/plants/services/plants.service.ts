import { supabase } from "../../../../lib/supabase/client";
import type { Plant, PlantRow, ProjectPlantRow } from "../types/plant.types";

function mapPlant(row: PlantRow): Plant {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
  };
}

export async function getPlantsByProject(projectId: string): Promise<Plant[]> {
  const { data: projectPlants, error: projectPlantsError } = await supabase
    .from("project_plants")
    .select("plant_id")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .returns<ProjectPlantRow[]>();

  if (projectPlantsError) {
    throw projectPlantsError;
  }

  if (projectPlants.length === 0) {
    return [];
  }

  const plantIds = projectPlants.map((item) => item.plant_id);

  const { data: plants, error: plantsError } = await supabase
    .from("plants")
    .select("id, code, name, description")
    .in("id", plantIds)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<PlantRow[]>();

  if (plantsError) {
    throw plantsError;
  }

  return plants.map(mapPlant);
}
