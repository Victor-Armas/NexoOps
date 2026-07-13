import { supabase } from "../../../../lib/supabase/client";
import type {
  SaveUnitMovementEventActionSettingPayload,
  UnitMovementEventActionSetting,
  UnitMovementEventActionSettingRow,
} from "../types/unit-movement-event-action-settings-admin.types";

const UNIT_MOVEMENT_EVENT_ACTION_COLUMNS =
  "id, project_id, event_type, label, sort_order, requires_movement, show_as_action, behavior, icon_key, color_key, is_system, is_active, updated_by, created_at, updated_at";

function mapUnitMovementEventActionSetting(
  row: UnitMovementEventActionSettingRow,
): UnitMovementEventActionSetting {
  return {
    id: row.id,
    projectId: row.project_id,
    eventType: row.event_type,
    label: row.label,
    sortOrder: row.sort_order,
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
    .order("sort_order", { ascending: true })
    .returns<UnitMovementEventActionSettingRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapUnitMovementEventActionSetting);
}

export async function saveUnitMovementEventActionSetting(
  payload: SaveUnitMovementEventActionSettingPayload,
): Promise<UnitMovementEventActionSetting> {
  const { data, error } = await supabase
    .from("unit_movement_event_action_settings")
    .upsert(
      {
        project_id: payload.projectId,
        event_type: payload.eventType,
        label: payload.label,
        sort_order: payload.sortOrder,
        requires_movement: payload.requiresMovement,
        show_as_action: payload.showAsAction,
        behavior: "status",
        icon_key: payload.iconKey,
        color_key: payload.colorKey,
        is_system: false,
        is_active: payload.isActive,
        updated_by: payload.updatedBy,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "project_id,event_type",
      },
    )
    .select(UNIT_MOVEMENT_EVENT_ACTION_COLUMNS)
    .single<UnitMovementEventActionSettingRow>();

  if (error) {
    throw error;
  }

  return mapUnitMovementEventActionSetting(data);
}
