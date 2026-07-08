import { supabase } from "../../../../lib/supabase/client";
import { subscribeToTableChanges } from "../../../../lib/supabase/realtime";
import type {
  CreatePlantCheckPayload,
  PlantCheck,
  PlantCheckRow,
} from "../types/plant-check.types";

const PLANT_CHECK_COLUMNS =
  "id, shift_id, plant_id, full_count, empty_count, pending_count, check_values, operational_condition, risk_level, notes, checked_by, checked_at, created_at, updated_at";

function mapPlantCheck(row: PlantCheckRow): PlantCheck {
  return {
    id: row.id,
    shiftId: row.shift_id,
    plantId: row.plant_id,
    fullCount: row.full_count,
    emptyCount: row.empty_count,
    pendingCount: row.pending_count,
    checkValues: row.check_values ?? {},
    operationalCondition: row.operational_condition,
    riskLevel: row.risk_level,
    notes: row.notes,
    checkedBy: row.checked_by,
    checkedAt: row.checked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPlantChecksByShiftAndPlant(params: {
  shiftId: string;
  plantId: string;
}): Promise<PlantCheck[]> {
  const { data, error } = await supabase
    .from("plant_checks")
    .select(PLANT_CHECK_COLUMNS)
    .eq("shift_id", params.shiftId)
    .eq("plant_id", params.plantId)
    .order("checked_at", { ascending: false })
    .returns<PlantCheckRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapPlantCheck);
}

export async function getPlantChecksByShift(
  shiftId: string,
): Promise<PlantCheck[]> {
  const { data, error } = await supabase
    .from("plant_checks")
    .select(PLANT_CHECK_COLUMNS)
    .eq("shift_id", shiftId)
    .order("checked_at", { ascending: false })
    .returns<PlantCheckRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapPlantCheck);
}

export async function createPlantCheck(
  payload: CreatePlantCheckPayload,
): Promise<PlantCheck> {
  const { data, error } = await supabase
    .from("plant_checks")
    .insert({
      shift_id: payload.shiftId,
      plant_id: payload.plantId,
      full_count: payload.fullCount,
      empty_count: payload.emptyCount,
      pending_count: payload.pendingCount,
      check_values: payload.checkValues,
      operational_condition: payload.operationalCondition,
      risk_level: payload.riskLevel,
      notes: payload.notes?.trim() || null,
    })
    .select(PLANT_CHECK_COLUMNS)
    .single<PlantCheckRow>();

  if (error) {
    throw error;
  }

  return mapPlantCheck(data);
}

export function subscribeToPlantChecksChanges(
  shiftId: string,
  onChange: () => void,
) {
  return subscribeToTableChanges({
    channelName: `plant-checks-${shiftId}`,
    table: "plant_checks",
    filter: `shift_id=eq.${shiftId}`,
    onChange,
  });
}
