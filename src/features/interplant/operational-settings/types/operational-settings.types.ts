export type OperationalSettings = {
  projectId: string;
  mealTargetMinutes: number;
  mealDelayLimitMinutes: number;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type OperationalSettingsRow = {
  project_id: string;
  meal_target_minutes: number;
  meal_delay_limit_minutes: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveOperationalSettingsPayload = {
  projectId: string;
  mealTargetMinutes: number;
  mealDelayLimitMinutes: number;
  updatedBy: string;
};
