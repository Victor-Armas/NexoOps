import type { UnitMovementEventType } from "../../unit-movement-events/types/unit-movement-event.types";

export type UnitMovementEventActionSetting = {
  id: string | null;
  projectId: string;
  eventType: UnitMovementEventType;
  label: string;
  sortOrder: number;
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
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveUnitMovementEventActionSettingPayload = {
  projectId: string;
  eventType: UnitMovementEventType;
  label: string;
  sortOrder: number;
  isActive: boolean;
  updatedBy: string;
};
