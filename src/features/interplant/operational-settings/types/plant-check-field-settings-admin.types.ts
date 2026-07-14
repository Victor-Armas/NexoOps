export type PlantCheckFieldSettingGroup = "full" | "empty";

export type PlantCheckFieldSetting = {
  id: string;
  projectId: string;
  plantId: string;
  fieldKey: string;
  label: string;
  fieldGroup: PlantCheckFieldSettingGroup;
  isActive: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlantCheckFieldSettingRow = {
  id: string;
  project_id: string;
  plant_id: string;
  field_key: string;
  label: string;
  field_group: PlantCheckFieldSettingGroup;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SavePlantCheckFieldSettingPayload = {
  id?: string;
  projectId: string;
  plantId: string;
  fieldKey: string;
  label: string;
  fieldGroup: PlantCheckFieldSettingGroup;
  isActive: boolean;
  updatedBy: string;
};

export type PlantCheckFieldSettingFormValues =
  SavePlantCheckFieldSettingPayload;
