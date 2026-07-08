import { supabase } from "../../../../lib/supabase/client";
import type {
  PlantCheckFieldSetting,
  PlantCheckFieldSettingRow,
  SavePlantCheckFieldSettingPayload,
} from "../types/plant-check-field-settings-admin.types";

const PLANT_CHECK_FIELD_SETTING_COLUMNS =
  "id, project_id, plant_id, field_key, label, field_group, sort_order, is_active, updated_by, created_at, updated_at";

function mapPlantCheckFieldSetting(
  row: PlantCheckFieldSettingRow,
): PlantCheckFieldSetting {
  return {
    id: row.id,
    projectId: row.project_id,
    plantId: row.plant_id,
    fieldKey: row.field_key,
    label: row.label,
    fieldGroup: row.field_group,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPlantCheckFieldSettingsByProject(
  projectId: string,
): Promise<PlantCheckFieldSetting[]> {
  const { data, error } = await supabase
    .from("plant_check_field_settings")
    .select(PLANT_CHECK_FIELD_SETTING_COLUMNS)
    .eq("project_id", projectId)
    .order("plant_id", { ascending: true })
    .order("sort_order", { ascending: true })
    .returns<PlantCheckFieldSettingRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapPlantCheckFieldSetting);
}

export async function savePlantCheckFieldSetting(
  payload: SavePlantCheckFieldSettingPayload,
): Promise<PlantCheckFieldSetting> {
  const basePayload = {
    project_id: payload.projectId,
    plant_id: payload.plantId,
    field_key: payload.fieldKey,
    label: payload.label,
    field_group: payload.fieldGroup,
    sort_order: payload.sortOrder,
    is_active: payload.isActive,
    updated_by: payload.updatedBy,
    updated_at: new Date().toISOString(),
  };

  const query = payload.id
    ? supabase
        .from("plant_check_field_settings")
        .update(basePayload)
        .eq("id", payload.id)
    : supabase.from("plant_check_field_settings").insert(basePayload);

  const { data, error } = await query
    .select(PLANT_CHECK_FIELD_SETTING_COLUMNS)
    .single<PlantCheckFieldSettingRow>();

  if (error) {
    throw error;
  }

  return mapPlantCheckFieldSetting(data);
}

export async function deletePlantCheckFieldSetting(id: string): Promise<void> {
  const { error } = await supabase
    .from("plant_check_field_settings")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
