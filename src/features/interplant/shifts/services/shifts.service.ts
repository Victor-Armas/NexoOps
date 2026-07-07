import { supabase } from "../../../../lib/supabase/client";
import { subscribeToTableChanges } from "../../../../lib/supabase/realtime";
import type { Shift, ShiftRow, ShiftType } from "../types/shift.types";

const SHIFT_COLUMNS =
  "id, project_id, shift_date, shift_type, status, supervisor_id, opened_at, closed_at, notes, created_by, created_at, updated_at";

function mapShift(row: ShiftRow): Shift {
  return {
    id: row.id,
    projectId: row.project_id,
    shiftDate: row.shift_date,
    shiftType: row.shift_type,
    status: row.status,
    supervisorId: row.supervisor_id,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getOpenShift(projectId: string): Promise<Shift | null> {
  const { data, error } = await supabase
    .from("shifts")
    .select(SHIFT_COLUMNS)
    .eq("project_id", projectId)
    .eq("status", "open")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapShift(data as ShiftRow);
}

export async function openShift(params: {
  projectId: string;
  supervisorId: string;
  shiftType: ShiftType;
  notes?: string;
}): Promise<Shift> {
  const { data, error } = await supabase
    .from("shifts")
    .insert({
      project_id: params.projectId,
      supervisor_id: params.supervisorId,
      shift_type: params.shiftType,
      notes: params.notes ?? null,
    })
    .select(SHIFT_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapShift(data as ShiftRow);
}

export async function closeShift(shiftId: string): Promise<Shift> {
  const { data, error } = await supabase
    .from("shifts")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", shiftId)
    .eq("status", "open")
    .select(SHIFT_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapShift(data as ShiftRow);
}

export function subscribeToProjectShiftsChanges(
  projectId: string,
  onChange: () => void,
) {
  return subscribeToTableChanges({
    channelName: `project-shifts-${projectId}`,
    table: "shifts",
    filter: `project_id=eq.${projectId}`,
    onChange,
  });
}
