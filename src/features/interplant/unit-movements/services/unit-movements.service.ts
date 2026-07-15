import { supabase } from "../../../../lib/supabase/client";
import { subscribeToTableChanges } from "../../../../lib/supabase/realtime";
import type { UnitOperationalPhase } from "../../unit-movement-events/types/unit-movement-event.types";
import type {
  ContinueUnitMovementPayload,
  CreateUnitMovementPayload,
  MovementType,
  MovementTypeRow,
  UnitMovement,
  UnitMovementRow,
} from "../types/unit-movement.types";

const UNIT_MOVEMENT_COLUMNS =
  "id, shift_id, unit_id, origin_plant_id, destination_plant_id, movement_type_id, quantity, status, notes, started_at, completed_at, created_by, created_at, updated_at";

type ShiftContextParams = {
  shiftId: string;
  unitIds: string[];
};

type AdvanceUnitMovementWorkflowPayload = {
  movementId: string;
  eventType: string;
  notes?: string;
  phase?: UnitOperationalPhase | null;
  plantId?: string | null;
};

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
  };
}

function getRpcMovementRow(data: unknown): UnitMovementRow {
  const row = Array.isArray(data) ? data[0] : data;

  if (!row || typeof row !== "object") {
    throw new Error("La operación no devolvió el movimiento actualizado.");
  }

  return row as UnitMovementRow;
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

export async function getUnitMovementsByShiftContext({
  shiftId,
  unitIds,
}: ShiftContextParams): Promise<UnitMovement[]> {
  if (unitIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("unit_movements")
    .select(UNIT_MOVEMENT_COLUMNS)
    .in("unit_id", unitIds)
    .or(`shift_id.eq.${shiftId},status.eq.open`)
    .order("started_at", { ascending: false })
    .returns<UnitMovementRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapUnitMovement);
}

export async function getUnitMovementsByShiftAndUnit(params: {
  shiftId: string;
  unitId: string;
}): Promise<UnitMovement[]> {
  const { data, error } = await supabase
    .from("unit_movements")
    .select(UNIT_MOVEMENT_COLUMNS)
    .eq("unit_id", params.unitId)
    .or(`shift_id.eq.${params.shiftId},status.eq.open`)
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

export async function createUnitMovementWorkflow(
  payload: CreateUnitMovementPayload,
): Promise<UnitMovement> {
  if (!payload.originPlantId || !payload.destinationPlantId) {
    throw new Error("El movimiento requiere una planta de origen y una de destino.");
  }

  const { data, error } = await supabase.rpc("create_unit_movement_workflow", {
    target_shift_id: payload.shiftId,
    target_unit_id: payload.unitId,
    target_origin_plant_id: payload.originPlantId,
    target_destination_plant_id: payload.destinationPlantId,
    target_movement_type_id: payload.movementTypeId,
    target_quantity: payload.quantity,
    target_notes: payload.notes?.trim() || null,
  });

  if (error) throw error;
  return mapUnitMovement(getRpcMovementRow(data));
}

export async function advanceUnitMovementWorkflow(
  payload: AdvanceUnitMovementWorkflowPayload,
): Promise<void> {
  const { error } = await supabase.rpc("advance_unit_movement_workflow", {
    target_movement_id: payload.movementId,
    target_event_type: payload.eventType,
    target_notes: payload.notes?.trim() || null,
    target_phase: payload.phase ?? null,
    target_plant_id: payload.plantId ?? null,
  });

  if (error) throw error;
}

export async function completeUnitMovementWorkflow(
  movementId: string,
): Promise<UnitMovement> {
  const { data, error } = await supabase.rpc("complete_unit_movement_workflow", {
    target_movement_id: movementId,
  });

  if (error) throw error;
  return mapUnitMovement(getRpcMovementRow(data));
}

export async function completeAndContinueUnitMovement(
  payload: ContinueUnitMovementPayload,
): Promise<UnitMovement> {
  const { data, error } = await supabase.rpc(
    "complete_and_continue_unit_movement",
    {
      target_movement_id: payload.movementId,
      next_shift_id: payload.shiftId,
      next_destination_plant_id: payload.destinationPlantId,
      next_movement_type_id: payload.movementTypeId,
      next_quantity: payload.quantity,
      next_notes: payload.notes?.trim() || null,
    },
  );

  if (error) throw error;
  return mapUnitMovement(getRpcMovementRow(data));
}

export async function cancelUnitMovementWorkflow(
  movementId: string,
): Promise<UnitMovement> {
  const { data, error } = await supabase.rpc("cancel_unit_movement_workflow", {
    target_movement_id: movementId,
  });

  if (error) throw error;
  return mapUnitMovement(getRpcMovementRow(data));
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
    .select("id, code, name, description")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<MovementTypeRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapMovementType);
}

export function subscribeToUnitMovementsChanges(
  shiftId: string,
  onChange: () => void,
  includeOpenCarryover = false,
) {
  return subscribeToTableChanges({
    channelName: includeOpenCarryover
      ? `unit-movements-context-${shiftId}`
      : `unit-movements-${shiftId}`,
    table: "unit_movements",
    filter: includeOpenCarryover ? undefined : `shift_id=eq.${shiftId}`,
    onChange,
  });
}

export function subscribeToUnitMovementChangesByUnit(
  unitId: string,
  onChange: () => void,
) {
  return subscribeToTableChanges({
    channelName: `unit-movements-unit-${unitId}`,
    table: "unit_movements",
    filter: `unit_id=eq.${unitId}`,
    onChange,
  });
}
