import type { PlantCheckActivityReportRow } from "./plant-check-activity.types";

export type OperationalHistoryView =
  | "personal"
  | "unidades"
  | "incidencias"
  | "cierres";

export type OperationalHistoryFilters = {
  startDate: string;
  endDate: string;
};

export type UserActivityReportRow = {
  user_id: string;
  full_name: string;
  email: string;
  plant_check_count: number;
  unit_event_count: number;
  movement_count: number;
  incident_count: number;
  total_activity_count: number;
  last_activity_at: string | null;
};

export type UnitActivityReportRow = {
  unit_id: string;
  unit_name: string;
  movement_count: number;
  completed_movement_count: number;
  cancelled_movement_count: number;
  open_movement_count: number;
  average_transport_minutes: number | null;
  minimum_transport_minutes: number | null;
  maximum_transport_minutes: number | null;
  event_count: number;
  incident_count: number;
};

export type UnitStatusDurationReportRow = {
  unit_id: string;
  unit_name: string;
  event_type: string;
  event_label: string;
  occurrence_count: number;
  average_minutes: number;
  minimum_minutes: number;
  maximum_minutes: number;
};

export type IncidentActivityReportRow = {
  category_id: string | null;
  category_name: string;
  category_scope: string;
  total_count: number;
  open_count: number;
  resolved_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  average_resolution_minutes: number | null;
};

export type IncidentDailyReportRow = {
  activity_date: string;
  total_count: number;
  open_count: number;
  resolved_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
};

export type OperationalHistoryData = {
  users: UserActivityReportRow[];
  units: UnitActivityReportRow[];
  statusDurations: UnitStatusDurationReportRow[];
  incidents: IncidentActivityReportRow[];
  incidentDaily: IncidentDailyReportRow[];
  plantChecks: PlantCheckActivityReportRow[];
};
