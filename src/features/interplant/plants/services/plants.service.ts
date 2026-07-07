import { supabase } from "../../../../lib/supabase/client";
import type { Plant, PlantRow, ProjectPlantRow } from "../types/plant.types";

function mapPlant(row: PlantRow, sortOrder: number): Plant {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder,
  };
}

export async function getPlantsByProject(projectId: string): Promise<Plant[]> {
  const { data: projectPlants, error: projectPlantsError } = await supabase
    .from("project_plants")
    .select("plant_id, sort_order")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
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
    .select("id, code, name, description, sort_order")
    .in("id", plantIds)
    .eq("is_active", true)
    .returns<PlantRow[]>();

  if (plantsError) {
    throw plantsError;
  }

  return projectPlants
    .map((projectPlant) => {
      const plant = plants.find((item) => item.id === projectPlant.plant_id);

      if (!plant) return null;

      return mapPlant(plant, projectPlant.sort_order);
    })
    .filter((plant): plant is Plant => plant !== null);
}
