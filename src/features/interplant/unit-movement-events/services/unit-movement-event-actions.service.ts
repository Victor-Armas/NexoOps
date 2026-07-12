import { supabase } from "../../../../lib/supabase/client";
import type {
  UnitMovementEventAction,
  UnitMovementEventActionSettingRow,
} from "../types/unit-movement-event-action.types";

const DEFAULT_UNIT_MOVEMENT_EVENT_ACTIONS: UnitMovementEventAction[] = [
  {
    eventType: "in_transit",
    label: "En camino",
    sortOrder: 10,
  },
  {
    eventType: "waiting_dock",
    label: "Esperando rampa",
    sortOrder: 20,
  },
  {
    eventType: "positioned",
    label: "En rampa",
    sortOrder: 30,
  },
  {
    eventType: "loading",
    label: "Cargando",
    sortOrder: 40,
  },
  {
    eventType: "unloading",
    label: "Descargando",
    sortOrder: 50,
  },
  {
    eventType: "released",
    label: "Saliendo de planta",
    sortOrder: 60,
  },
  {
    eventType: "driver_change",
    label: "Cambio operador",
    sortOrder: 70,
  },
];

function mapUnitMovementEventAction(
  row: UnitMovementEventActionSettingRow,
): UnitMovementEventAction {
  return {
    eventType: row.event_type,
    label: row.label,
    sortOrder: row.sort_order,
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
    .select("id, event_type, label, sort_order")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<UnitMovementEventActionSettingRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapUnitMovementEventAction);
}
