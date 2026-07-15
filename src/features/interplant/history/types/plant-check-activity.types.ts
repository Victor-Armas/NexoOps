import type { ShiftType } from "../../shifts/types/shift.types";

export type PlantCheckActivityReportRow = {
  shift_id: string;
  shift_date: string;
  shift_type: ShiftType;
  plant_id: string;
  plant_code: string;
  plant_name: string;
  user_id: string;
  full_name: string;
  check_count: number;
  first_checked_at: string;
  last_checked_at: string;
};
