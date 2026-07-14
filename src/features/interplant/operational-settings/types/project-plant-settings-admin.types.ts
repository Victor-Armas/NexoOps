export type ProjectPlantSetting = {
  projectId: string;
  plantId: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  plantIsActive: boolean;
};

export type ProjectPlantSettingRow = {
  project_id: string;
  plant_id: string;
  is_active: boolean;
};

export type PlantSettingRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export type SaveProjectPlantSettingPayload = {
  projectId: string;
  plantId: string;
  isActive: boolean;
};
