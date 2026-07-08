export type OperationalSettings = {
  projectId: string;
  mealTargetMinutes: number;
  mealDelayLimitMinutes: number;
  mediumFullCountThreshold: number;
  mediumEmptyCountThreshold: number;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type OperationalSettingsRow = {
  project_id: string;
  meal_target_minutes: number;
  meal_delay_limit_minutes: number;
  medium_full_count_threshold: number;
  medium_empty_count_threshold: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveOperationalSettingsPayload = {
  projectId: string;
  mealTargetMinutes: number;
  mealDelayLimitMinutes: number;
  mediumFullCountThreshold: number;
  mediumEmptyCountThreshold: number;
  updatedBy: string;
};
