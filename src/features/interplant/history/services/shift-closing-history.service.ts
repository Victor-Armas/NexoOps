import {
  getMonterreyUtcDateRange,
} from "../../../../lib/date-time/monterrey-time";
import { supabase } from "../../../../lib/supabase/client";
import { getPlantCheckActivityReport } from "./plant-check-activity.service";
import type {
  ShiftClosingHistoryData,
  ShiftClosingHistoryFilters,
  ShiftClosingHistoryItem,
  ShiftClosingHistoryRow,
} from "../types/shift-closing-history.types";

const SHIFT_CLOSING_HISTORY_COLUMNS = `
  id,
  shift_id,
  plant_checked_count,
  plant_total_count,
  full_count,
  empty_count,
  pending_count,
  high_risk_plant_count,
  movement_total_count,
  movement_completed_count,
  movement_cancelled_count,
  movement_open_count,
  movement_quantity_total,
  incident_total_count,
  incident_open_count,
  incident_resolved_count,
  incident_high_severity_count,
  notes,
  closed_at,
  shifts!inner(
    id,
    shift_date,
    shift_type,
    opened_at,
    closed_at
  )
`;

function mapShiftClosingHistoryItem(
  row: ShiftClosingHistoryRow,
): ShiftClosingHistoryItem {
  return {
    id: row.id,
    shiftId: row.shift_id,
    shiftDate: row.shifts.shift_date,
    shiftType: row.shifts.shift_type,
    openedAt: row.shifts.opened_at,
    shiftClosedAt: row.shifts.closed_at,
    closedAt: row.closed_at,
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
  };
}

export async function getShiftClosingHistory(params: {
  projectId: string;
  filters: ShiftClosingHistoryFilters;
}): Promise<ShiftClosingHistoryData> {
  const { rangeStart, rangeEnd } = getMonterreyUtcDateRange(
    params.filters.startDate,
    params.filters.endDate,
  );

  let query = supabase
    .from("shift_closings")
    .select(SHIFT_CLOSING_HISTORY_COLUMNS)
    .eq("shifts.project_id", params.projectId)
    .gte("closed_at", rangeStart)
    .lt("closed_at", rangeEnd)
    .order("closed_at", { ascending: false })
    .limit(100);

  if (params.filters.shiftType !== "all") {
    query = query.eq("shifts.shift_type", params.filters.shiftType);
  }

  const { data, error } = await query.returns<ShiftClosingHistoryRow[]>();

  if (error) {
    throw error;
  }

  const items = data.map(mapShiftClosingHistoryItem);
  const plantCheckActivity =
    items.length === 0
      ? []
      : await getPlantCheckActivityReport({
          projectId: params.projectId,
          shiftIds: items.map((item) => item.shiftId),
        });

  return {
    items,
    plantCheckActivity,
  };
}

export async function deleteShiftPermanently(shiftId: string) {
  const { error } = await supabase.rpc("delete_shift_permanently", {
    target_shift_id: shiftId,
  });

  if (error) {
    throw error;
  }
}
