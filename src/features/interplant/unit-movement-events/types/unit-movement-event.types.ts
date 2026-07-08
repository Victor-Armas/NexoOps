export type UnitMovementEventType =
  | "departure_requested"
  | "in_transit"
  | "waiting_dock"
  | "positioned"
  | "loading"
  | "unloading"
  | "released"
  | "meal"
  | "meal_finished"
  | "driver_change"
  | "completed"
  | "cancelled";

export type UnitMovementEvent = {
  id: string;
  unitMovementId: string;
  eventType: UnitMovementEventType;
  notes: string | null;
  eventAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type UnitMovementEventRow = {
  id: string;
  unit_movement_id: string;
  event_type: UnitMovementEventType;
  notes: string | null;
  event_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CreateUnitMovementEventPayload = {
  unitMovementId: string;
  eventType: UnitMovementEventType;
  notes?: string;
};

export const UNIT_MOVEMENT_EVENT_LABELS: Record<UnitMovementEventType, string> =
  {
    departure_requested: "Salida indicada",
    in_transit: "En camino",
    waiting_dock: "Esperando rampa",
    positioned: "En rampa",
    loading: "Cargando",
    unloading: "Descargando",
    released: "Saliendo de planta",
    meal: "Comida",
    meal_finished: "Comida finalizada",
    driver_change: "Cambio operador",
    completed: "Completado",
    cancelled: "Cancelado",
  };
