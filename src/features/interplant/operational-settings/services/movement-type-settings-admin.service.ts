import { supabase } from "../../../../lib/supabase/client";
import type {
  MovementTypeSetting,
  MovementTypeSettingRow,
  SaveMovementTypeSettingPayload,
} from "../types/movement-type-settings-admin.types";

const MOVEMENT_TYPE_COLUMNS =
  "id, code, name, description, sort_order, is_active, created_at, updated_at";

function mapMovementTypeSetting(
  row: MovementTypeSettingRow,
): MovementTypeSetting {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getMovementTypeSettings(): Promise<
  MovementTypeSetting[]
> {
  const { data, error } = await supabase
    .from("movement_types")
    .select(MOVEMENT_TYPE_COLUMNS)
    .order("sort_order", { ascending: true })
    .returns<MovementTypeSettingRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapMovementTypeSetting);
}

export async function saveMovementTypeSetting(
  payload: SaveMovementTypeSettingPayload,
): Promise<MovementTypeSetting> {
  const basePayload = {
    code: payload.code,
    name: payload.name,
    description: payload.description,
    sort_order: payload.sortOrder,
    is_active: payload.isActive,
    updated_at: new Date().toISOString(),
  };

  const query = payload.id
    ? supabase.from("movement_types").update(basePayload).eq("id", payload.id)
    : supabase.from("movement_types").insert(basePayload);

  const { data, error } = await query
    .select(MOVEMENT_TYPE_COLUMNS)
    .single<MovementTypeSettingRow>();

  if (error) {
    throw error;
  }

  return mapMovementTypeSetting(data);
}
