import type { UnitMovementEventBehavior } from "../../unit-movement-events/types/unit-movement-event-action.types";
import type { UnitMovementEventType } from "../../unit-movement-events/types/unit-movement-event.types";

export type UnitMovementEventActionSetting = {
  id: string | null;
  projectId: string;
  eventType: UnitMovementEventType;
  label: string;
  sortOrder: number;
  requiresMovement: boolean;
  showAsAction: boolean;
  behavior: UnitMovementEventBehavior;
  iconKey: string;
  colorKey: string;
  isSystem: boolean;
  isActive: boolean;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UnitMovementEventActionSettingRow = {
  id: string;
  project_id: string;
  event_type: UnitMovementEventType;
  label: string;
  sort_order: number;
  requires_movement: boolean;
  show_as_action: boolean;
  behavior: UnitMovementEventBehavior;
  icon_key: string;
  color_key: string;
  is_system: boolean;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveUnitMovementEventActionSettingPayload = {
  id?: string | null;
  projectId: string;
  eventType: UnitMovementEventType;
  label: string;
  sortOrder: number;
  requiresMovement: boolean;
  showAsAction: boolean;
  behavior?: UnitMovementEventBehavior;
  iconKey: string;
  colorKey: string;
  isSystem?: boolean;
  isActive: boolean;
  updatedBy: string;
};
