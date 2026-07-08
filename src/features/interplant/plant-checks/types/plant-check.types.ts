export type PlantRiskLevel = "low" | "medium" | "high";

export type PlantCheckValues = Record<string, number>;

export type PlantOperationalCondition =
  | "normal"
  | "no_unload_space"
  | "no_dock_available"
  | "material_priority"
  | "other";

export type PlantCheck = {
  id: string;
  shiftId: string;
  plantId: string;
  fullCount: number;
  emptyCount: number;
  pendingCount: number;
  checkValues: PlantCheckValues;
  operationalCondition: PlantOperationalCondition | null;
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
  check_values: PlantCheckValues | null;
  operational_condition: PlantOperationalCondition | null;
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
  checkValues: PlantCheckValues;
  operationalCondition: PlantOperationalCondition;
  riskLevel: PlantRiskLevel;
  notes?: string;
};

export const PLANT_RISK_LABELS: Record<PlantRiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

export const PLANT_OPERATIONAL_CONDITION_LABELS: Record<
  PlantOperationalCondition,
  string
> = {
  normal: "Operación normal",
  no_unload_space: "Sin espacio para descarga",
  no_dock_available: "Sin rampa disponible",
  material_priority: "Material con prioridad",
  other: "Otra condición",
};
