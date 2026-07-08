import { supabase } from "../../../../lib/supabase/client";
import type {
  OperationalSettings,
  OperationalSettingsRow,
  SaveOperationalSettingsPayload,
} from "../types/operational-settings.types";

const OPERATIONAL_SETTINGS_COLUMNS =
  "project_id, meal_target_minutes, meal_delay_limit_minutes, medium_full_count_threshold, medium_empty_count_threshold, updated_by, created_at, updated_at";

const DEFAULT_MEAL_TARGET_MINUTES = 60;
const DEFAULT_MEAL_DELAY_LIMIT_MINUTES = 75;
const DEFAULT_MEDIUM_FULL_COUNT_THRESHOLD = 10;
const DEFAULT_MEDIUM_EMPTY_COUNT_THRESHOLD = 15;

function mapOperationalSettings(
  row: OperationalSettingsRow,
): OperationalSettings {
  return {
    projectId: row.project_id,
    mealTargetMinutes: row.meal_target_minutes,
    mealDelayLimitMinutes: row.meal_delay_limit_minutes,
    mediumFullCountThreshold: row.medium_full_count_threshold,
    mediumEmptyCountThreshold: row.medium_empty_count_threshold,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getDefaultOperationalSettings(
  projectId: string,
): OperationalSettings {
  return {
    projectId,
    mealTargetMinutes: DEFAULT_MEAL_TARGET_MINUTES,
    mealDelayLimitMinutes: DEFAULT_MEAL_DELAY_LIMIT_MINUTES,
    mediumFullCountThreshold: DEFAULT_MEDIUM_FULL_COUNT_THRESHOLD,
    mediumEmptyCountThreshold: DEFAULT_MEDIUM_EMPTY_COUNT_THRESHOLD,
    updatedBy: null,
    createdAt: null,
    updatedAt: null,
  };
}

export async function getOperationalSettings(
  projectId: string,
): Promise<OperationalSettings> {
  const { data, error } = await supabase
    .from("project_operational_settings")
    .select(OPERATIONAL_SETTINGS_COLUMNS)
    .eq("project_id", projectId)
    .maybeSingle<OperationalSettingsRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return getDefaultOperationalSettings(projectId);
  }

  return mapOperationalSettings(data);
}

export async function saveOperationalSettings(
  payload: SaveOperationalSettingsPayload,
): Promise<OperationalSettings> {
  const { data, error } = await supabase
    .from("project_operational_settings")
    .upsert(
      {
        project_id: payload.projectId,
        meal_target_minutes: payload.mealTargetMinutes,
        meal_delay_limit_minutes: payload.mealDelayLimitMinutes,
        medium_full_count_threshold: payload.mediumFullCountThreshold,
        medium_empty_count_threshold: payload.mediumEmptyCountThreshold,
        updated_by: payload.updatedBy,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "project_id",
      },
    )
    .select(OPERATIONAL_SETTINGS_COLUMNS)
    .single<OperationalSettingsRow>();

  if (error) {
    throw error;
  }

  return mapOperationalSettings(data);
}
