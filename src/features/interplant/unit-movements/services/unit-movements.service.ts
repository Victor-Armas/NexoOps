import { supabase } from "../../../../lib/supabase/client";
import { subscribeToTableChanges } from "../../../../lib/supabase/realtime";
import type {
  CreateUnitMovementPayload,
  MovementType,
  MovementTypeRow,
  UnitMovement,
  UnitMovementRow,
} from "../types/unit-movement.types";

const UNIT_MOVEMENT_COLUMNS =
  "id, shift_id, unit_id, origin_plant_id, destination_plant_id, movement_type_id, quantity, status, notes, started_at, completed_at, created_by, created_at, updated_at";

function mapUnitMovement(row: UnitMovementRow): UnitMovement {
  return {
    id: row.id,
    shiftId: row.shift_id,
    unitId: row.unit_id,
    originPlantId: row.origin_plant_id,
    destinationPlantId: row.destination_plant_id,
    movementTypeId: row.movement_type_id,
    quantity: row.quantity,
    status: row.status,
    notes: row.notes,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMovementType(row: MovementTypeRow): MovementType {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export async function getUnitMovementsByShift(
  shiftId: string,
): Promise<UnitMovement[]> {
  const { data, error } = await supabase
    .from("unit_movements")
    .select(UNIT_MOVEMENT_COLUMNS)
    .eq("shift_id", shiftId)
    .order("started_at", { ascending: false })
    .returns<UnitMovementRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapUnitMovement);
}

export async function createUnitMovement(
  payload: CreateUnitMovementPayload,
): Promise<UnitMovement> {
  const { data, error } = await supabase
    .from("unit_movements")
    .insert({
      shift_id: payload.shiftId,
      unit_id: payload.unitId,
      origin_plant_id: payload.originPlantId,
      destination_plant_id: payload.destinationPlantId,
      movement_type_id: payload.movementTypeId,
      quantity: payload.quantity,
      notes: payload.notes?.trim() || null,
    })
    .select(UNIT_MOVEMENT_COLUMNS)
    .single<UnitMovementRow>();

  if (error) {
    throw error;
  }

  return mapUnitMovement(data);
}

export async function completeUnitMovement(
  movementId: string,
): Promise<UnitMovement> {
  const { data, error } = await supabase
    .from("unit_movements")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", movementId)
    .eq("status", "open")
    .select(UNIT_MOVEMENT_COLUMNS)
    .single<UnitMovementRow>();

  if (error) {
    throw error;
  }

  return mapUnitMovement(data);
}

export async function cancelUnitMovement(
  movementId: string,
): Promise<UnitMovement> {
  const { data, error } = await supabase
    .from("unit_movements")
    .update({
      status: "cancelled",
      completed_at: new Date().toISOString(),
    })
    .eq("id", movementId)
    .eq("status", "open")
    .select(UNIT_MOVEMENT_COLUMNS)
    .single<UnitMovementRow>();

  if (error) {
    throw error;
  }

  return mapUnitMovement(data);
}

export async function getMovementTypes(): Promise<MovementType[]> {
  const { data, error } = await supabase
    .from("movement_types")
    .select("id, code, name, description, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<MovementTypeRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapMovementType);
}

export function subscribeToUnitMovementsChanges(
  shiftId: string,
  onChange: () => void,
) {
  return subscribeToTableChanges({
    channelName: `unit-movements-${shiftId}`,
    table: "unit_movements",
    filter: `shift_id=eq.${shiftId}`,
    onChange,
  });
}

export async function getUnitMovementsByShiftAndUnit(params: {
  shiftId: string;
  unitId: string;
}): Promise<UnitMovement[]> {
  const { data, error } = await supabase
    .from("unit_movements")
    .select(UNIT_MOVEMENT_COLUMNS)
    .eq("shift_id", params.shiftId)
    .eq("unit_id", params.unitId)
    .order("started_at", { ascending: false })
    .returns<UnitMovementRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapUnitMovement);
}
