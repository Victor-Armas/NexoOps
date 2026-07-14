export type ProjectUnitSetting = {
  projectId: string;
  unitId: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  unitIsActive: boolean;
};

export type ProjectUnitSettingRow = {
  project_id: string;
  unit_id: string;
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
  isActive: boolean;
};
