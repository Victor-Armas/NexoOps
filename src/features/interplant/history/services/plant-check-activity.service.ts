import { supabase } from "../../../../lib/supabase/client";
import type { PlantCheckActivityReportRow } from "../types/plant-check-activity.types";

type PlantCheckActivityReportParams = {
  projectId: string;
  rangeStart?: string | null;
  rangeEnd?: string | null;
  shiftIds?: string[] | null;
  userId?: string | null;
};

export async function getPlantCheckActivityReport({
  projectId,
  rangeStart = null,
  rangeEnd = null,
  shiftIds = null,
  userId = null,
}: PlantCheckActivityReportParams): Promise<PlantCheckActivityReportRow[]> {
  const { data, error } = await supabase.rpc("get_plant_check_activity_report", {
    target_project_id: projectId,
    range_start: rangeStart,
    range_end: rangeEnd,
    target_shift_ids: shiftIds,
    target_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as PlantCheckActivityReportRow[]).map((row) => ({
    ...row,
    check_count: Number(row.check_count ?? 0),
  }));
}
