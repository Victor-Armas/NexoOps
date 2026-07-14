import { supabase } from "../../../../lib/supabase/client";
import type {
  IncidentActivityReportRow,
  IncidentDailyReportRow,
  OperationalHistoryData,
  UnitActivityReportRow,
  UnitStatusDurationReportRow,
  UserActivityReportRow,
} from "../types/operational-history.types";

type OperationalHistoryRequest = {
  projectId: string;
  rangeStart: string;
  rangeEnd: string;
};

export async function getOperationalHistoryData({
  projectId,
  rangeStart,
  rangeEnd,
}: OperationalHistoryRequest): Promise<OperationalHistoryData> {
  const [usersResult, unitsResult, durationsResult, incidentsResult, dailyResult] =
    await Promise.all([
      supabase.rpc("get_user_activity_report", {
        target_project_id: projectId,
        range_start: rangeStart,
        range_end: rangeEnd,
        target_user_id: null,
      }),
      supabase.rpc("get_unit_activity_report", {
        target_project_id: projectId,
        range_start: rangeStart,
        range_end: rangeEnd,
        target_unit_id: null,
      }),
      supabase.rpc("get_unit_status_duration_report", {
        target_project_id: projectId,
        range_start: rangeStart,
        range_end: rangeEnd,
        target_unit_id: null,
      }),
      supabase.rpc("get_incident_activity_report", {
        target_project_id: projectId,
        range_start: rangeStart,
        range_end: rangeEnd,
        target_scope: null,
        target_category_id: null,
      }),
      supabase.rpc("get_incident_daily_report", {
        target_project_id: projectId,
        range_start: rangeStart,
        range_end: rangeEnd,
      }),
    ]);

  const firstError =
    usersResult.error ||
    unitsResult.error ||
    durationsResult.error ||
    incidentsResult.error ||
    dailyResult.error;

  if (firstError) {
    throw firstError;
  }

  return {
    users: (usersResult.data ?? []) as UserActivityReportRow[],
    units: (unitsResult.data ?? []) as UnitActivityReportRow[],
    statusDurations: (durationsResult.data ?? []) as UnitStatusDurationReportRow[],
    incidents: (incidentsResult.data ?? []) as IncidentActivityReportRow[],
    incidentDaily: (dailyResult.data ?? []) as IncidentDailyReportRow[],
  };
}
