import type { UnitMovementEventType } from "./unit-movement-event.types";

export type UnitMovementEventAction = {
  eventType: UnitMovementEventType;
  label: string;
  sortOrder: number;
};

export type UnitMovementEventActionSettingRow = {
  id: string;
  event_type: UnitMovementEventType;
  label: string;
  sort_order: number;
};
