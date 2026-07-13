import { supabase } from "../../../../lib/supabase/client";
import type {
  UnitMovementEventAction,
  UnitMovementEventActionSettingRow,
  UnitMovementEventBehavior,
} from "../types/unit-movement-event-action.types";

function createDefaultAction(params: {
  eventType: string;
  label: string;
  sortOrder: number;
  requiresMovement: boolean;
  showAsAction: boolean;
  behavior?: UnitMovementEventBehavior;
  iconKey: string;
  colorKey: string;
}): UnitMovementEventAction {
  return {
    id: `default:${params.eventType}`,
    eventType: params.eventType,
    label: params.label,
    sortOrder: params.sortOrder,
    requiresMovement: params.requiresMovement,
    showAsAction: params.showAsAction,
    behavior: params.behavior ?? "status",
    iconKey: params.iconKey,
    colorKey: params.colorKey,
    isSystem: true,
    isActive: true,
  };
}

const DEFAULT_UNIT_MOVEMENT_EVENT_ACTIONS: UnitMovementEventAction[] = [
  createDefaultAction({
    eventType: "departure_requested",
    label: "Salida indicada",
    sortOrder: 5,
    requiresMovement: true,
    showAsAction: false,
    iconKey: "truck",
    colorKey: "neutral",
  }),
  createDefaultAction({
    eventType: "in_transit",
    label: "En camino",
    sortOrder: 10,
    requiresMovement: true,
    showAsAction: true,
    iconKey: "truck",
    colorKey: "blue",
  }),
  createDefaultAction({
    eventType: "waiting_dock",
    label: "Esperando rampa",
    sortOrder: 20,
    requiresMovement: true,
    showAsAction: true,
    iconKey: "clock",
    colorKey: "amber",
  }),
  createDefaultAction({
    eventType: "positioned",
    label: "En rampa",
    sortOrder: 30,
    requiresMovement: true,
    showAsAction: true,
    iconKey: "map_pin",
    colorKey: "amber",
  }),
  createDefaultAction({
    eventType: "loading",
    label: "Cargando",
    sortOrder: 40,
    requiresMovement: true,
    showAsAction: true,
    iconKey: "forklift",
    colorKey: "blue",
  }),
  createDefaultAction({
    eventType: "unloading",
    label: "Descargando",
    sortOrder: 50,
    requiresMovement: true,
    showAsAction: true,
    iconKey: "forklift",
    colorKey: "blue",
  }),
  createDefaultAction({
    eventType: "released",
    label: "Saliendo de planta",
    sortOrder: 60,
    requiresMovement: true,
    showAsAction: true,
    iconKey: "truck",
    colorKey: "blue",
  }),
  createDefaultAction({
    eventType: "driver_change",
    label: "Cambio operador",
    sortOrder: 70,
    requiresMovement: false,
    showAsAction: true,
    iconKey: "refresh",
    colorKey: "amber",
  }),
  createDefaultAction({
    eventType: "meal",
    label: "Comida",
    sortOrder: 900,
    requiresMovement: false,
    showAsAction: false,
    behavior: "meal_start",
    iconKey: "utensils",
    colorKey: "amber",
  }),
  createDefaultAction({
    eventType: "meal_finished",
    label: "Comida finalizada",
    sortOrder: 910,
    requiresMovement: false,
    showAsAction: false,
    behavior: "meal_end",
    iconKey: "utensils",
    colorKey: "success",
  }),
  createDefaultAction({
    eventType: "completed",
    label: "Completado",
    sortOrder: 920,
    requiresMovement: true,
    showAsAction: false,
    behavior: "movement_complete",
    iconKey: "check",
    colorKey: "success",
  }),
  createDefaultAction({
    eventType: "cancelled",
    label: "Cancelado",
    sortOrder: 930,
    requiresMovement: true,
    showAsAction: false,
    behavior: "movement_cancel",
    iconKey: "x",
    colorKey: "danger",
  }),
];

function mapUnitMovementEventAction(
  row: UnitMovementEventActionSettingRow,
): UnitMovementEventAction {
  return {
    id: row.id,
    eventType: row.event_type,
    label: row.label,
    sortOrder: row.sort_order,
    requiresMovement: row.requires_movement,
    showAsAction: row.show_as_action,
    behavior: row.behavior,
    iconKey: row.icon_key,
    colorKey: row.color_key,
    isSystem: row.is_system,
    isActive: row.is_active,
  };
}

export function getDefaultUnitMovementEventActions() {
  return DEFAULT_UNIT_MOVEMENT_EVENT_ACTIONS;
}

export async function getUnitMovementEventActionSettings(
  projectId: string,
): Promise<UnitMovementEventAction[]> {
  const { data, error } = await supabase
    .from("unit_movement_event_action_settings")
    .select(
      "id, event_type, label, sort_order, requires_movement, show_as_action, behavior, icon_key, color_key, is_system, is_active",
    )
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<UnitMovementEventActionSettingRow[]>();

  if (error) {
    throw error;
  }

  return data.length > 0
    ? data.map(mapUnitMovementEventAction)
    : DEFAULT_UNIT_MOVEMENT_EVENT_ACTIONS;
}
