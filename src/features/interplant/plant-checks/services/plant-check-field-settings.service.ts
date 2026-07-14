import { supabase } from "../../../../lib/supabase/client";
import type { PlantCheckField } from "../config/plant-check-field.config";

type PlantCheckFieldSettingRow = {
  id: string;
  field_key: string;
  label: string;
  field_group: "full" | "empty";
};

function mapPlantCheckField(row: PlantCheckFieldSettingRow): PlantCheckField {
  return {
    key: row.field_key,
    label: row.label,
    group: row.field_group,
  };
}

export async function getPlantCheckFieldSettings(params: {
  projectId: string;
  plantId: string;
}): Promise<PlantCheckField[]> {
  const { data, error } = await supabase
    .from("plant_check_field_settings")
    .select("id, field_key, label, field_group")
    .eq("project_id", params.projectId)
    .eq("plant_id", params.plantId)
    .eq("is_active", true)
    .order("field_group", { ascending: true })
    .order("label", { ascending: true })
    .returns<PlantCheckFieldSettingRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapPlantCheckField);
}
