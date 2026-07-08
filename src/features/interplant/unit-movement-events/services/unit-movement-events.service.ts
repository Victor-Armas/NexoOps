import { supabase } from "../../../../lib/supabase/client";
import { subscribeToTableChanges } from "../../../../lib/supabase/realtime";
import type {
  CreateUnitMovementEventPayload,
  UnitMovementEvent,
  UnitMovementEventRow,
} from "../types/unit-movement-event.types";

const UNIT_MOVEMENT_EVENT_COLUMNS =
  "id, unit_movement_id, event_type, notes, event_at, created_by, created_at, updated_at";

function mapUnitMovementEvent(row: UnitMovementEventRow): UnitMovementEvent {
  return {
    id: row.id,
    unitMovementId: row.unit_movement_id,
    eventType: row.event_type,
    notes: row.notes,
    eventAt: row.event_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUnitMovementEvents(
  unitMovementId: string,
): Promise<UnitMovementEvent[]> {
  const { data, error } = await supabase
    .from("unit_movement_events")
    .select(UNIT_MOVEMENT_EVENT_COLUMNS)
    .eq("unit_movement_id", unitMovementId)
    .order("event_at", { ascending: false })
    .returns<UnitMovementEventRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapUnitMovementEvent);
}

export async function createUnitMovementEvent(
  payload: CreateUnitMovementEventPayload,
): Promise<UnitMovementEvent> {
  const { data, error } = await supabase
    .from("unit_movement_events")
    .insert({
      unit_movement_id: payload.unitMovementId,
      event_type: payload.eventType,
      notes: payload.notes?.trim() || null,
    })
    .select(UNIT_MOVEMENT_EVENT_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapUnitMovementEvent(data as UnitMovementEventRow);
}

export function subscribeToUnitMovementEventsChanges(
  unitMovementId: string,
  onChange: () => void,
) {
  return subscribeToTableChanges({
    channelName: `unit-movement-events-${unitMovementId}`,
    table: "unit_movement_events",
    filter: `unit_movement_id=eq.${unitMovementId}`,
    onChange,
  });
}

export async function getUnitMovementEventsByMovementIds(
  unitMovementIds: string[],
): Promise<UnitMovementEvent[]> {
  if (unitMovementIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("unit_movement_events")
    .select(UNIT_MOVEMENT_EVENT_COLUMNS)
    .in("unit_movement_id", unitMovementIds)
    .order("event_at", { ascending: false })
    .returns<UnitMovementEventRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapUnitMovementEvent);
}

export function subscribeToUnitMovementEventsTableChanges(
  onChange: () => void,
) {
  return subscribeToTableChanges({
    channelName: "unit-movement-events-latest",
    table: "unit_movement_events",
    onChange,
  });
}
