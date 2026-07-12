import type { ShiftType } from "../../shifts/types/shift.types";

export type ShiftClosingHistoryFilters = {
    startDate: string;
    endDate: string;
    shiftType: ShiftType | "all";
};

export type ShiftClosingHistoryItem = {
    id: string;
    shiftId: string;
    shiftDate: string;
    shiftType: ShiftType;
    openedAt: string;
    shiftClosedAt: string | null;
    closedAt: string;
    plantCheckedCount: number;
    plantTotalCount: number;
    fullCount: number;
    emptyCount: number;
    pendingCount: number;
    highRiskPlantCount: number;
    movementTotalCount: number;
    movementCompletedCount: number;
    movementCancelledCount: number;
    movementOpenCount: number;
    movementQuantityTotal: number;
    notes: string | null;
};

export type ShiftClosingHistoryShiftRow = {
    id: string;
    shift_date: string;
    shift_type: ShiftType;
    opened_at: string;
    closed_at: string | null;
};

export type ShiftClosingHistoryRow = {
    id: string;
    shift_id: string;
    plant_checked_count: number;
    plant_total_count: number;
    full_count: number;
    empty_count: number;
    pending_count: number;
    high_risk_plant_count: number;
    movement_total_count: number;
    movement_completed_count: number;
    movement_cancelled_count: number;
    movement_open_count: number;
    movement_quantity_total: number;
    notes: string | null;
    closed_at: string;
    shifts: ShiftClosingHistoryShiftRow;
};
