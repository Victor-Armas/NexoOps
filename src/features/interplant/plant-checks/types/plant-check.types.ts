export type PlantRiskLevel = "low" | "medium" | "high";

export type PlantCheck = {
  id: string;
  shiftId: string;
  plantId: string;
  fullCount: number;
  emptyCount: number;
  pendingCount: number;
  riskLevel: PlantRiskLevel;
  notes: string | null;
  checkedBy: string;
  checkedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PlantCheckRow = {
  id: string;
  shift_id: string;
  plant_id: string;
  full_count: number;
  empty_count: number;
  pending_count: number;
  risk_level: PlantRiskLevel;
  notes: string | null;
  checked_by: string;
  checked_at: string;
  created_at: string;
  updated_at: string;
};

export type CreatePlantCheckPayload = {
  shiftId: string;
  plantId: string;
  fullCount: number;
  emptyCount: number;
  pendingCount: number;
  riskLevel: PlantRiskLevel;
  notes?: string;
};

export const PLANT_RISK_LABELS: Record<PlantRiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};
