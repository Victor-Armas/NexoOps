export type ProjectUnitSetting = {
  projectId: string;
  unitId: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  unitIsActive: boolean;
};

export type ProjectUnitSettingRow = {
  project_id: string;
  unit_id: string;
  sort_order: number;
  is_active: boolean;
};

export type UnitSettingRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export type SaveProjectUnitSettingPayload = {
  projectId: string;
  unitId: string;
  sortOrder: number;
  isActive: boolean;
};
