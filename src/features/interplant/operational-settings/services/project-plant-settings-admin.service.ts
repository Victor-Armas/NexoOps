import { supabase } from "../../../../lib/supabase/client";
import type {
  PlantSettingRow,
  ProjectPlantSetting,
  ProjectPlantSettingRow,
  SaveProjectPlantSettingPayload,
} from "../types/project-plant-settings-admin.types";

function mapProjectPlantSetting(params: {
  projectPlant: ProjectPlantSettingRow;
  plant: PlantSettingRow;
}): ProjectPlantSetting {
  return {
    projectId: params.projectPlant.project_id,
    plantId: params.projectPlant.plant_id,
    code: params.plant.code,
    name: params.plant.name,
    description: params.plant.description,
    sortOrder: params.projectPlant.sort_order,
    isActive: params.projectPlant.is_active,
    plantIsActive: params.plant.is_active,
  };
}

async function assertPlantCanBeDisabled(plantId: string) {
  const { count, error } = await supabase
    .from("unit_movements")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("status", "open")
    .or(`origin_plant_id.eq.${plantId},destination_plant_id.eq.${plantId}`);

  if (error) {
    throw error;
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "No puedes desactivar esta planta porque está en un movimiento abierto.",
    );
  }
}

export async function getProjectPlantSettings(
  projectId: string,
): Promise<ProjectPlantSetting[]> {
  const { data: projectPlants, error: projectPlantsError } = await supabase
    .from("project_plants")
    .select("project_id, plant_id, sort_order, is_active")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .returns<ProjectPlantSettingRow[]>();

  if (projectPlantsError) {
    throw projectPlantsError;
  }

  if (projectPlants.length === 0) {
    return [];
  }

  const plantIds = projectPlants.map((projectPlant) => projectPlant.plant_id);

  const { data: plants, error: plantsError } = await supabase
    .from("plants")
    .select("id, code, name, description, is_active")
    .in("id", plantIds)
    .returns<PlantSettingRow[]>();

  if (plantsError) {
    throw plantsError;
  }

  return projectPlants
    .map((projectPlant) => {
      const plant = plants.find((item) => item.id === projectPlant.plant_id);

      if (!plant) {
        return null;
      }

      return mapProjectPlantSetting({
        projectPlant,
        plant,
      });
    })
    .filter(
      (projectPlant): projectPlant is ProjectPlantSetting =>
        projectPlant !== null,
    );
}

export async function saveProjectPlantSetting(
  payload: SaveProjectPlantSettingPayload,
): Promise<ProjectPlantSetting> {
  if (!payload.isActive) {
    await assertPlantCanBeDisabled(payload.plantId);
  }

  const { error } = await supabase
    .from("project_plants")
    .update({
      sort_order: payload.sortOrder,
      is_active: payload.isActive,
    })
    .eq("project_id", payload.projectId)
    .eq("plant_id", payload.plantId);

  if (error) {
    throw error;
  }

  const projectPlantSettings = await getProjectPlantSettings(payload.projectId);
  const updatedProjectPlant = projectPlantSettings.find(
    (projectPlant) => projectPlant.plantId === payload.plantId,
  );

  if (!updatedProjectPlant) {
    throw new Error("No se pudo obtener la planta actualizada.");
  }

  return updatedProjectPlant;
}
