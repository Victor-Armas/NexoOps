export type ShiftType = "morning" | "afternoon" | "night";
export type ShiftStatus = "open" | "closed";

export type Shift = {
  id: string;
  projectId: string;
  shiftDate: string;
  shiftType: ShiftType;
  status: ShiftStatus;
  supervisorId: string;
  openedAt: string;
  closedAt: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShiftRow = {
  id: string;
  project_id: string;
  shift_date: string;
  shift_type: ShiftType;
  status: ShiftStatus;
  supervisor_id: string;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  morning: "Turno Mañana",
  afternoon: "Turno Tarde",
  night: "Turno Noche",
};
