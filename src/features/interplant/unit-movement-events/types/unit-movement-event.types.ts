export const DIESEL_REFUELING_STARTED_EVENT = "diesel_refueling";
export const DIESEL_REFUELING_FINISHED_EVENT = "diesel_refueling_finished";

export const DIESEL_REFUELING_EVENT_TYPES = [
  DIESEL_REFUELING_STARTED_EVENT,
  DIESEL_REFUELING_FINISHED_EVENT,
] as const;

export const DRIVER_CHANGE_STARTED_EVENT = "driver_change";
export const DRIVER_CHANGE_FINISHED_EVENT = "driver_change_finished";

export const DRIVER_CHANGE_EVENT_TYPES = [
  DRIVER_CHANGE_STARTED_EVENT,
  DRIVER_CHANGE_FINISHED_EVENT,
] as const;

export type UnitMovementEventType = string;
export type UnitOperationalPhase =
  | "origin"
  | "transit"
  | "destination"
  | "standalone";

export type UnitMovementEvent = {
  id: string;
  unitId: string;
  shiftId: string;
  unitMovementId: string | null;
  eventTypeId: string;
  eventType: UnitMovementEventType;
  phase: UnitOperationalPhase | null;
  plantId: string | null;
  notes: string | null;
  eventAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type UnitMovementEventRow = {
  id: string;
  unit_id: string;
  shift_id: string;
  unit_movement_id: string | null;
  event_type_id: string;
  event_type: UnitMovementEventType;
  phase: UnitOperationalPhase | null;
  plant_id: string | null;
  notes: string | null;
  event_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CreateUnitMovementEventPayload = {
  unitMovementId?: string;
  unitId?: string;
  shiftId?: string;
  eventTypeId?: string;
  eventType: UnitMovementEventType;
  phase?: UnitOperationalPhase | null;
  plantId?: string | null;
  notes?: string;
};

const BUILT_IN_UNIT_MOVEMENT_EVENT_LABELS: Record<string, string> = {
  departure_requested: "Salida indicada",
  in_transit: "En camino",
  waiting_dock: "Esperando rampa",
  waiting_documents: "Esperando documentación",
  positioned: "En rampa",
  loading: "Cargando",
  loading_finished: "Carga finalizada",
  unloading: "Descargando",
  unloading_finished: "Descarga finalizada",
  released: "Saliendo de planta",
  meal: "Comida",
  meal_finished: "Comida finalizada",
  driver_change: "Cambio de operador",
  driver_change_finished: "Cambio de operador finalizado",
  diesel_refueling: "Carga de diésel",
  diesel_refueling_finished: "Carga de diésel finalizada",
  completed: "Completado",
  cancelled: "Cancelado",
  guard: "Resguardo",
};

function humanizeEventType(eventType: string) {
  return eventType
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function registerUnitMovementEventLabels(
  entries: Array<{ eventType: string; label: string }>,
) {
  entries.forEach(({ eventType, label }) => {
    if (eventType && label.trim()) {
      BUILT_IN_UNIT_MOVEMENT_EVENT_LABELS[eventType] = label.trim();
    }
  });
}

export function getDefaultUnitMovementEventLabel(eventType: string) {
  return (
    BUILT_IN_UNIT_MOVEMENT_EVENT_LABELS[eventType] ??
    humanizeEventType(eventType)
  );
}

export const UNIT_MOVEMENT_EVENT_LABELS: Record<string, string> = new Proxy(
  BUILT_IN_UNIT_MOVEMENT_EVENT_LABELS,
  {
    get(target, property) {
      if (typeof property !== "string") {
        return Reflect.get(target, property);
      }

      return target[property] ?? humanizeEventType(property);
    },
  },
);
