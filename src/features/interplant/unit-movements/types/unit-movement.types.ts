export type UnitMovementStatus = "open" | "completed" | "cancelled";

export type UnitMovement = {
  id: string;
  shiftId: string;
  unitId: string;
  originPlantId: string | null;
  destinationPlantId: string | null;
  movementTypeId: string | null;
  quantity: number;
  status: UnitMovementStatus;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type UnitMovementRow = {
  id: string;
  shift_id: string;
  unit_id: string;
  origin_plant_id: string | null;
  destination_plant_id: string | null;
  movement_type_id: string | null;
  quantity: number;
  status: UnitMovementStatus;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CreateUnitMovementPayload = {
  shiftId: string;
  unitId: string;
  originPlantId: string | null;
  destinationPlantId: string | null;
  movementTypeId: string | null;
  quantity: number;
  notes?: string;
};

export type MovementType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type MovementTypeRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export const UNIT_MOVEMENT_STATUS_LABELS: Record<UnitMovementStatus, string> = {
  open: "En proceso",
  completed: "Completado",
  cancelled: "Cancelado",
};
