import { supabase } from "../../../../lib/supabase/client";
import type {
  CreateShiftClosingPayload,
  ShiftClosing,
  ShiftClosingRow,
} from "../types/shift-closing.types";

const SHIFT_CLOSING_COLUMNS =
  "id, shift_id, closed_by, plant_checked_count, plant_total_count, full_count, empty_count, pending_count, high_risk_plant_count, movement_total_count, movement_completed_count, movement_cancelled_count, movement_open_count, movement_quantity_total, incident_total_count, incident_open_count, incident_resolved_count, incident_high_severity_count, notes, closed_at, created_at, updated_at";

function mapShiftClosing(row: ShiftClosingRow): ShiftClosing {
  return {
    id: row.id,
    shiftId: row.shift_id,
    closedBy: row.closed_by,
    plantCheckedCount: row.plant_checked_count,
    plantTotalCount: row.plant_total_count,
    fullCount: row.full_count,
    emptyCount: row.empty_count,
    pendingCount: row.pending_count,
    highRiskPlantCount: row.high_risk_plant_count,
    movementTotalCount: row.movement_total_count,
    movementCompletedCount: row.movement_completed_count,
    movementCancelledCount: row.movement_cancelled_count,
    movementOpenCount: row.movement_open_count,
    movementQuantityTotal: row.movement_quantity_total,
    incidentTotalCount: row.incident_total_count,
    incidentOpenCount: row.incident_open_count,
    incidentResolvedCount: row.incident_resolved_count,
    incidentHighSeverityCount: row.incident_high_severity_count,
    notes: row.notes,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function upsertShiftClosing(
  payload: CreateShiftClosingPayload,
): Promise<ShiftClosing> {
  const { data, error } = await supabase
    .from("shift_closings")
    .upsert(
      {
        shift_id: payload.shiftId,
        plant_checked_count: payload.plantCheckedCount,
        plant_total_count: payload.plantTotalCount,
        full_count: payload.fullCount,
        empty_count: payload.emptyCount,
        pending_count: payload.pendingCount,
        high_risk_plant_count: payload.highRiskPlantCount,
        movement_total_count: payload.movementTotalCount,
        movement_completed_count: payload.movementCompletedCount,
        movement_cancelled_count: payload.movementCancelledCount,
        movement_open_count: payload.movementOpenCount,
        movement_quantity_total: payload.movementQuantityTotal,
        incident_total_count: payload.incidentTotalCount,
        incident_open_count: payload.incidentOpenCount,
        incident_resolved_count: payload.incidentResolvedCount,
        incident_high_severity_count: payload.incidentHighSeverityCount,
        notes: payload.notes?.trim() || null,
      },
      {
        onConflict: "shift_id",
      },
    )
    .select(SHIFT_CLOSING_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapShiftClosing(data as ShiftClosingRow);
}

export async function getShiftClosing(
  shiftId: string,
): Promise<ShiftClosing | null> {
  const { data, error } = await supabase
    .from("shift_closings")
    .select(SHIFT_CLOSING_COLUMNS)
    .eq("shift_id", shiftId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapShiftClosing(data as ShiftClosingRow);
}
