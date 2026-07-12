import { supabase } from "../../../../lib/supabase/client";
import type {
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

function getDayStart(date: string) {
    return `${date}T00:00:00.000Z`;
}

function getDayEnd(date: string) {
    return `${date}T23:59:59.999Z`;
}

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
        notes: row.notes,
    };
}

export async function getShiftClosingHistory(params: {
    projectId: string;
    filters: ShiftClosingHistoryFilters;
}): Promise<ShiftClosingHistoryItem[]> {
    let query = supabase
        .from("shift_closings")
        .select(SHIFT_CLOSING_HISTORY_COLUMNS)
        .eq("shifts.project_id", params.projectId)
        .gte("closed_at", getDayStart(params.filters.startDate))
        .lte("closed_at", getDayEnd(params.filters.endDate))
        .order("closed_at", { ascending: false })
        .limit(100);

    if (params.filters.shiftType !== "all") {
        query = query.eq("shifts.shift_type", params.filters.shiftType);
    }

    const { data, error } = await query.returns<ShiftClosingHistoryRow[]>();

    if (error) {
        throw error;
    }

    return data.map(mapShiftClosingHistoryItem);
}
