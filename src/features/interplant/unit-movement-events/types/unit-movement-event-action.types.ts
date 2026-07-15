import type { UnitMovementEventType } from "./unit-movement-event.types";

export type UnitMovementEventBehavior =
  | "status"
  | "meal_start"
  | "meal_end"
  | "fuel_start"
  | "fuel_end"
  | "driver_change_start"
  | "driver_change_end"
  | "movement_complete"
  | "movement_cancel";

export type UnitMovementEventAction = {
  id: string;
  eventType: UnitMovementEventType;
  label: string;
  requiresMovement: boolean;
  showAsAction: boolean;
  behavior: UnitMovementEventBehavior;
  iconKey: string;
  colorKey: string;
  isSystem: boolean;
  isActive: boolean;
};

export type UnitMovementEventActionSettingRow = {
  id: string;
  event_type: UnitMovementEventType;
  label: string;
  requires_movement: boolean;
  show_as_action: boolean;
  behavior: UnitMovementEventBehavior;
  icon_key: string;
  color_key: string;
  is_system: boolean;
  is_active: boolean;
};
