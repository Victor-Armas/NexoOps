import { supabase } from "../../../../lib/supabase/client";
import type {
  SaveUnitMovementEventActionSettingPayload,
  UnitMovementEventActionSetting,
  UnitMovementEventActionSettingRow,
} from "../types/unit-movement-event-action-settings-admin.types";

const UNIT_MOVEMENT_EVENT_ACTION_COLUMNS =
  "id, project_id, event_type, label, requires_movement, show_as_action, behavior, icon_key, color_key, is_system, is_active, updated_by, created_at, updated_at";

function mapUnitMovementEventActionSetting(
  row: UnitMovementEventActionSettingRow,
): UnitMovementEventActionSetting {
  return {
    id: row.id,
    projectId: row.project_id,
    eventType: row.event_type,
    label: row.label,
    requiresMovement: row.requires_movement,
    showAsAction: row.show_as_action,
    behavior: row.behavior,
    iconKey: row.icon_key,
    colorKey: row.color_key,
    isSystem: row.is_system,
    isActive: row.is_active,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUnitMovementEventActionSettingsByProject(
  projectId: string,
): Promise<UnitMovementEventActionSetting[]> {
  const { data, error } = await supabase
    .from("unit_movement_event_action_settings")
    .select(UNIT_MOVEMENT_EVENT_ACTION_COLUMNS)
    .eq("project_id", projectId)
    .order("label", { ascending: true })
    .returns<UnitMovementEventActionSettingRow[]>();

  if (error) throw error;
  return data.map(mapUnitMovementEventActionSetting);
}

export async function saveUnitMovementEventActionSetting(
  payload: SaveUnitMovementEventActionSettingPayload,
): Promise<UnitMovementEventActionSetting> {
  const commonValues = {
    label: payload.label,
    show_as_action: payload.showAsAction,
    icon_key: payload.iconKey,
    color_key: payload.colorKey,
    is_active: payload.isActive,
    updated_by: payload.updatedBy,
    updated_at: new Date().toISOString(),
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from("unit_movement_event_action_settings")
      .update({
        ...commonValues,
        ...(payload.isSystem
          ? {}
          : {
              requires_movement: payload.requiresMovement,
              behavior: payload.behavior ?? "status",
            }),
      })
      .eq("id", payload.id)
      .eq("project_id", payload.projectId)
      .select(UNIT_MOVEMENT_EVENT_ACTION_COLUMNS)
      .single<UnitMovementEventActionSettingRow>();

    if (error) throw error;
    return mapUnitMovementEventActionSetting(data);
  }

  const { data, error } = await supabase
    .from("unit_movement_event_action_settings")
    .insert({
      project_id: payload.projectId,
      event_type: payload.eventType,
      ...commonValues,
      requires_movement: payload.requiresMovement,
      behavior: payload.behavior ?? "status",
      is_system: false,
    })
    .select(UNIT_MOVEMENT_EVENT_ACTION_COLUMNS)
    .single<UnitMovementEventActionSettingRow>();

  if (error) throw error;
  return mapUnitMovementEventActionSetting(data);
}
