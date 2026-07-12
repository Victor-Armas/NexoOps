export type ProjectPlantSetting = {
  projectId: string;
  plantId: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  plantIsActive: boolean;
};

export type ProjectPlantSettingRow = {
  project_id: string;
  plant_id: string;
  sort_order: number;
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
  sortOrder: number;
  isActive: boolean;
};
